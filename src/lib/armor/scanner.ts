import Groq from 'groq-sdk';

export type ScanFinding = {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  description: string;
  fileLocation: string;
  codeSnippet: string;
};

export interface FileChange {
  filename: string;
  patch: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Non-executable text, assets, metadata or dependency configurations that shouldn't be audited
const IGNORED_EXTENSIONS = [
  'lock.json', '.lock', 'lock.yaml', '.csv',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.gz',
  '.md', 'tsconfig.json'
];

const IGNORED_PATHS = [
  'dist/', 'build/', '.next/', 'node_modules/', 'prisma/migrations/'
];

function shouldIgnore(filename: string): boolean {
  const lower = filename.toLowerCase();
  
  // 1. Path-level exclusions
  if (IGNORED_PATHS.some(path => lower.includes(path))) {
    return true;
  }
  
  // 2. Extension-level exclusions
  if (IGNORED_EXTENSIONS.some(ext => lower.endsWith(ext))) {
    return true;
  }

  // 3. Ignore configuration wrappers (Note: .env.example is intentionally NOT ignored here)
  const ignorePatterns = ['package.json', 'components.json', 'prisma.config.ts', '.gitignore'];
  if (ignorePatterns.some(pattern => lower.includes(pattern))) {
    return true;
  }

  return false;
}

/**
 * Extracts only newly added or modified lines from a unified diff patch.
 * This filters out context lines, metadata headers, and deleted lines.
 */
function extractAddedLines(patch: string): string {
  if (!patch) return '';
  return patch
    .split('\n')
    // Keep lines starting with '+' but exclude the '+++' file target header line
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    // Strip the leading '+' prefix so it passes valid syntax to the LLM
    .map(line => line.slice(1))
    .join('\n');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ArmorIQScanner {
  async scanPullRequest(files: FileChange[], activePolicies: any[] = []): Promise<ScanFinding[]> {
    let combinedContent = '';
    const scannedFilesList: string[] = [];
    
    const MAX_COMBINED_LENGTH = 8000; 

    for (const file of files) {
      if (shouldIgnore(file.filename)) {
        console.log(`🛡️ Skipping ignored file: ${file.filename}`);
        continue;
      }

      const addedLines = extractAddedLines(file.patch || '');
      
      if (!addedLines.trim()) {
        continue;
      }

      scannedFilesList.push(file.filename);
      combinedContent += `--- START FILE: ${file.filename} ---\n${addedLines}\n--- END FILE: ${file.filename} ---\n\n`;
    }

    if (!combinedContent.trim()) {
      return [];
    }

    if (combinedContent.length > MAX_COMBINED_LENGTH) {
      combinedContent = combinedContent.substring(0, MAX_COMBINED_LENGTH) + "\n\n...[TRUNCATED FOR SIZE]...";
    }

    // --- 1. DYNAMIC POLICY INSTRUCTION GENERATION ---
    let policyInstructions = `1. Hardcoded secrets (actual active production string values like a valid "sk-proj-..." key or high-entropy credentials).\n2. Contextual leaks (explicitly logging secret variables to the console or exposing them to clients).`;

    if (activePolicies && activePolicies.length > 0) {
      policyInstructions += `\n\nAdditionally, the user has enabled specific security policies. You MUST ALSO scan for the following:\n`;
      activePolicies.forEach((policy, index) => {
        policyInstructions += `${index + 3}. ${policy.name}: ${policy.description}\n`;
      });
    } else {
      policyInstructions += `\n\nCRITICAL: DO NOT focus on or flag general vulnerabilities like SQL injection, XSS, logic flaws, or broad data leaks. ONLY FOCUS ON THE DEFAULT SECRET-RELATED ISSUES ABOVE.`;
    }

    // --- 2. UPDATED PROMPT ---
    const prompt = `Analyze the following aggregated code changes from a Pull Request for security vulnerabilities.
Look strictly for the following configured issues:

${policyInstructions}

The changes are organized under individual file demarcation boundaries labeled '--- START FILE: <filename> ---'. 
CRITICAL: Carefully track which file the code snippet belongs to and report its exact name in the 'fileLocation' field.

Aggregated Code Changes:
${combinedContent}

Respond strictly with a valid JSON object containing a "findings" property which holds the array of vulnerabilities. If no issues exist, return an empty array under the findings key.
Format:
{
  "findings": [
    {
      "type": "Secret | Vulnerability | Misconfig",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "description": "Detailed explanation.",
      "fileLocation": "The exact path/filename containing this vulnerability",
      "codeSnippet": "The specific problematic line(s) of code"
    }
  ]
}`;

    let findings: ScanFinding[] = [];
    let success = false;
    let retries = 3;

    // 3. Fire a single batch request
    while (!success && retries > 0) {
      try {
        console.log(`🔍 Triggering consolidated security scan for files: [${scannedFilesList.join(', ')}]...`);
        
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an elite application security auditor. Output raw JSON only.
              
CRITICAL RULES:
1. ONLY flag actual, executable vulnerabilities in the code structure.
2. IGNORE theoretical or infrastructure-level risks (e.g., do not flag environment variables just because a server "could" be compromised).
3. Reading from "process.env" or importing "dotenv" is strictly SAFE and expected backend behavior. NEVER flag this.
4. You MUST return a root JSON object with a "findings" key array. The field "codeSnippet" MUST be returned strictly as a single flat string.

5. ENVIRONMENT & TEMPLATE PLACEHOLDER FILTER RULES:
   - When scanning environment template files (such as .env.example), you MUST differentiate between mock placeholders and real credentials.
   - NEVER flag values that contain generic filler text, descriptions, or standard placeholders. 
   - Explicitly IGNORE values containing words like: "your_", "actual_", "secret_here", "_id_here", "generate_a_random", "localhost", "user:password", "your_webhook_secret", or "-----BEGIN RSA PRIVATE KEY-----\\n...". These are safe templates.
   - ONLY flag a line if the value contains a specific, high-entropy alphanumeric string (e.g. an actual active production token or key) that was clearly pasted by a developer by mistake.` 
            },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '{"findings": []}';
        const result = JSON.parse(responseText);
        
        // Extract raw array safely from the root object's property
        const rawFindings = result.findings || [];
        
        // Defensive Layer: Clean and sanitize findings to guarantee absolute runtime type compliance
        const sanitizedFindings: ScanFinding[] = rawFindings.map((f: any) => {
          let normalizedSnippet = '';
          
          if (typeof f.codeSnippet === 'string') {
            normalizedSnippet = f.codeSnippet;
          } else if (f.codeSnippet !== null && f.codeSnippet !== undefined) {
            normalizedSnippet = typeof f.codeSnippet === 'object'
              ? JSON.stringify(f.codeSnippet, null, 2)
              : String(f.codeSnippet);
          }

          const upperSeverity = String(f.severity || 'MEDIUM').toUpperCase();
          const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];

          return {
            type: String(f.type || 'Vulnerability'),
            severity: validSeverities.includes(upperSeverity) ? (upperSeverity as any) : 'MEDIUM',
            description: String(f.description || 'No description provided.'),
            fileLocation: String(f.fileLocation || 'Unknown file path'),
            codeSnippet: normalizedSnippet
          };
        });

        findings = sanitizedFindings;
        success = true;

      } catch (error: any) {
        if (error.status === 429) {
          const retryAfterHeader = error.headers?.get?.('retry-after') || error.headers?.['retry-after'];
          const waitTime = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : (4 - retries) * 25000;
          
          console.warn(`⏳ Rate limit reached on batch call. Waiting ${waitTime / 1000} seconds...`);
          await delay(waitTime);
          retries--;
        } else {
          console.error(`❌ Consolidated scan failed completely:`, error);
          break;
        }
      }
    }

    return findings;
  }
}

export const scanner = new ArmorIQScanner();