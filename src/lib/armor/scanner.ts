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
  '.json', '.lock', '.yaml', '.yml', '.prisma', '.md', '.sql', '.txt', '.csv',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.gz'
];

const IGNORED_PATHS = [
  'dist/', 'build/', '.next/', 'public/', 'node_modules/', '.idx/', 'prisma/migrations/'
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
  
  // 3. System configurations and seed layout structures
  if (lower.includes('.config.') || lower.startsWith('.') || lower.includes('seed.ts')) {
    return true;
  }

  return false;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ArmorIQScanner {
  async scanPullRequest(files: FileChange[]): Promise<ScanFinding[]> {
    const findings: ScanFinding[] = [];
    
    // Capped at 6000 characters (~1,500 tokens) to guarantee the input, 
    // system instructions, and completion safely slide into Groq's 12,000 TPM limit.
    const MAX_PATCH_LENGTH = 6000; 

    for (const file of files) {
      if (shouldIgnore(file.filename)) {
        console.log(`🛡️ Skipping ignored file: ${file.filename}`);
        continue;
      }

      let patchContent = file.patch || '';
      
      if (patchContent.length > MAX_PATCH_LENGTH) {
        console.log(`⚠️ Truncating massive file: ${file.filename}`);
        patchContent = patchContent.substring(0, MAX_PATCH_LENGTH) + "\n\n...[TRUNCATED FOR SIZE]...";
      }

      const prompt = `Analyze the following code changes (git patch) for security vulnerabilities.
Look for:
1. Hardcoded secrets (actual string values like "sk-...").
2. Contextual leaks (explicitly logging variables to the console or exposing them to clients).
3. Logic flaws.

File: ${file.filename}
Patch:
${patchContent}

Respond ONLY in strictly valid JSON containing an array of findings. If no vulnerabilities exist, return an empty array [].
Format:
[{
  "type": "Secret | Vulnerability | Misconfig",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "description": "Detailed explanation.",
  "fileLocation": "${file.filename}",
  "codeSnippet": "The specific problematic line(s) of code"
}]`;

      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          console.log(`🔍 Scanning ${file.filename}...`);
          
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: `You are an elite application security auditor. Output raw JSON only.
                
CRITICAL RULES:
1. ONLY flag actual, executable vulnerabilities in the code structure.
2. IGNORE theoretical or infrastructure-level risks (e.g., do not flag environment variables just because a server "could" be compromised).
3. IGNORE any code found inside strings, comments, or template literals. Do not scan text that is meant to be a prompt or instruction.
4. Reading from "process.env" or importing "dotenv" is strictly SAFE and expected backend behavior. NEVER flag this.` 
              },
              { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
          });

          const responseText = chatCompletion.choices[0]?.message?.content || '{"findings": []}';
          const result = JSON.parse(responseText);
          const fileFindings = Array.isArray(result) ? result : (result.findings || []);
          
          findings.push(...fileFindings);
          success = true;

          // Adaptive wait to minimize hitting sliding TPM windows on sequential requests
          await delay(3000); 

        } catch (error: any) {
          if (error.status === 429) {
            // Check for standard API header hints, otherwise apply progressive backoff
            const retryAfterHeader = error.headers?.get?.('retry-after') || error.headers?.['retry-after'];
            const waitTime = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : (4 - retries) * 25000;
            
            console.warn(`⏳ Rate limit reached scanning ${file.filename}. Waiting ${waitTime / 1000} seconds...`);
            await delay(waitTime);
            retries--;
          } else if (error.status === 413) {
            console.error(`❌ File STILL too large even after truncation: ${file.filename}. Skipping.`);
            break; 
          } else {
            console.error(`❌ Failed to scan file ${file.filename}:`, error);
            break;
          }
        }
      }
    }

    return findings;
  }
}

export const scanner = new ArmorIQScanner();