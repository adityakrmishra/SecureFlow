
export type ScanFinding = {
  type: 'Secret' | 'Vulnerability' | 'Misconfig' | 'DangerousFunction';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  description: string;
  fileLocation: string;
  codeSnippet: string;
};

export interface ScannerProvider {
  scanPullRequest(files: string[]): Promise<ScanFinding[]>;
}

export class ArmorClawScanner implements ScannerProvider {
  async scanPullRequest(files: string[]): Promise<ScanFinding[]> {
    // Simulate high-fidelity scan logic
    // In a real implementation, this would call specialized binary tools or remote APIs
    const findings: ScanFinding[] = [];

    // Mock detection logic for demonstration
    if (files.some(f => f.includes('.env') || f.includes('config'))) {
      findings.push({
        type: 'Secret',
        severity: 'CRITICAL',
        description: 'Hardcoded OpenAI API key detected',
        fileLocation: 'src/config/index.ts',
        codeSnippet: "const OPENAI_KEY = 'sk-proj-12345...'"
      });
    }

    if (files.some(f => f.includes('package.json'))) {
      findings.push({
        type: 'Vulnerability',
        severity: 'HIGH',
        description: 'Lodash < 4.17.21 vulnerable to prototype pollution',
        fileLocation: 'package.json',
        codeSnippet: '"lodash": "4.17.15"'
      });
    }

    return findings;
  }
}

export const claw = new ArmorClawScanner();
