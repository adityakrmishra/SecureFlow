
export const MOCK_STATS = {
  totalScans: 1248,
  blockedPRs: 42,
  approvedPRs: 896,
  secretsDetected: 15,
  avgRemediationTime: "12m",
};

export const MOCK_REPOS = [
  { id: '1', name: 'secure-flow/frontend', stars: 124, status: 'Active', scans: 450 },
  { id: '2', name: 'secure-flow/api-gateway', stars: 89, status: 'Active', scans: 312 },
  { id: '3', name: 'secure-flow/auth-service', stars: 56, status: 'Active', scans: 198 },
  { id: '4', name: 'acme-corp/infra-as-code', stars: 210, status: 'Active', scans: 288 },
];

export const MOCK_PRS = [
  { id: '1', title: 'Add new payment gateway integration', number: 452, status: 'BLOCKED', severity: 'CRITICAL', author: 'johndoe', time: '2h ago' },
  { id: '2', title: 'Update dependencies and fix lint errors', number: 451, status: 'PASS', severity: 'LOW', author: 'janedoe', time: '5h ago' },
  { id: '3', title: 'Refactor user authentication flow', number: 450, status: 'REVIEW REQUIRED', severity: 'MEDIUM', author: 'security-guru', time: '1d ago' },
  { id: '4', title: 'Optimize docker build process', number: 449, status: 'PASS', severity: 'NONE', author: 'devops-king', time: '2d ago' },
];

export const MOCK_FINDINGS = [
  { 
    id: 'f1', 
    file: 'src/lib/config.ts:12', 
    issue: 'Hardcoded OpenAI API Key', 
    severity: 'CRITICAL', 
    type: 'Secret',
    explanation: 'A hardcoded API key was detected in your configuration file. This exposes your budget and account to unauthorized access.',
    remediation: 'Move the API key to an environment variable and rotate the existing secret immediately.'
  },
  { 
    id: 'f2', 
    file: 'package.json:45', 
    issue: 'Vulnerable Dependency (lodash < 4.17.21)', 
    severity: 'HIGH', 
    type: 'Vulnerability',
    explanation: 'The version of lodash used has a known Prototype Pollution vulnerability.',
    remediation: 'Run "npm update lodash" to update to the latest patched version.'
  },
  { 
    id: 'f3', 
    file: 'infra/db-config.yaml:8', 
    issue: 'S3 Bucket Public Read Access', 
    severity: 'MEDIUM', 
    type: 'Misconfig',
    explanation: 'The cloud configuration allows public read access to a sensitive data bucket.',
    remediation: 'Change ACL to "private" and use signed URLs for temporary public access.'
  }
];

export const MOCK_CHART_DATA = [
  { name: 'Mon', scans: 145, risk: 12 },
  { name: 'Tue', scans: 132, risk: 8 },
  { name: 'Wed', scans: 164, risk: 24 },
  { name: 'Thu', scans: 156, risk: 15 },
  { name: 'Fri', scans: 182, risk: 10 },
  { name: 'Sat', scans: 45, risk: 2 },
  { name: 'Sun', scans: 38, risk: 5 },
];

export const MOCK_AUDIT_LOGS = [
  { id: 'a1', user: 'system', action: 'Scan Triggered', resource: 'PR #452', decision: '-', timestamp: '2023-10-27 14:20:11' },
  { id: 'a2', user: 'security-bot', action: 'Policy Evaluation', resource: 'PR #452', decision: 'BLOCK', timestamp: '2023-10-27 14:20:15' },
  { id: 'a3', user: 'admin', action: 'Repository Added', resource: 'acme-corp/infra-as-code', decision: 'SUCCESS', timestamp: '2023-10-26 09:15:00' },
  { id: 'a4', user: 'jane-dev', action: 'PR Comment Posted', resource: 'PR #451', decision: 'INFO', timestamp: '2023-10-27 10:05:32' },
];
