
import { NextRequest, NextResponse } from 'next/server';
import { claw } from '@/lib/armor/claw';
import { iq } from '@/lib/armor/iq';
import { developerReceivesAISecurityExplanations } from '@/ai/flows/developer-receives-ai-security-explanations';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = req.headers.get('x-github-event');

    if (!['pull_request'].includes(event || '')) {
      return NextResponse.json({ message: 'Event not tracked' }, { status: 200 });
    }

    const { action, pull_request, repository } = payload;

    // Supported actions: opened, synchronize, reopened
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return NextResponse.json({ message: 'Action not tracked' }, { status: 200 });
    }

    console.log(`Processing PR #${pull_request.number} on ${repository.full_name}`);

    // 1. Fetch changed files (Mocked for this flow)
    const files = ['src/config/index.ts', 'package.json'];

    // 2. ArmorClaw Scan
    const findings = await claw.scanPullRequest(files);

    // 3. AI Analysis
    const enrichedFindings = await Promise.all(findings.map(async finding => {
      const aiResponse = await developerReceivesAISecurityExplanations({
        findingType: finding.type,
        severity: finding.severity,
        description: finding.description,
        fileLocation: finding.fileLocation,
        codeSnippet: finding.codeSnippet || ''
      });
      return {
        ...finding,
        explanation: aiResponse.explanation,
        remediation: aiResponse.remediationSuggestions
      };
    }));

    // 4. ArmorIQ Policy Decision
    const decision = iq.evaluateFindings(findings);

    // 5. Update GitHub Status Check & Comment (Mocked implementation)
    // In production, this would use an Octokit client with a GitHub App installation token
    console.log(`Decision: ${decision}`);
    console.log('AI explanations generated for:', enrichedFindings.length, 'findings');

    // 6. Persist to DB (Mocked for Demo)
    // db.PullRequest.update(...)

    return NextResponse.json({ 
      success: true, 
      decision, 
      findingCount: findings.length 
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
