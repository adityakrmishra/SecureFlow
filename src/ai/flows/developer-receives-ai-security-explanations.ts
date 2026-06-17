'use server';
/**
 * @fileOverview A Genkit flow that generates plain-English explanations and remediation suggestions for security findings.
 *
 * - developerReceivesAISecurityExplanations - A function that handles the AI explanation process.
 * - AISecurityExplanationInput - The input type for the developerReceivesAISecurityExplanations function.
 * - AISecurityExplanationOutput - The return type for the developerReceivesAISecurityExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISecurityExplanationInputSchema = z.object({
  findingType: z
    .string()
    .describe('The type of security finding (e.g., Hardcoded OpenAI API key).'),
  severity: z.string().describe('The severity of the finding (e.g., CRITICAL, HIGH, MEDIUM, LOW).'),
  description: z.string().describe('A detailed description of the security issue from the scanner.'),
  fileLocation: z.string().describe('The file path and line number where the finding was detected.'),
  codeSnippet: z.string().describe('The relevant code snippet related to the finding.'),
});
export type AISecurityExplanationInput = z.infer<typeof AISecurityExplanationInputSchema>;

const AISecurityExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A plain-English explanation of the security finding, easily understandable by a developer.'),
  remediationSuggestions: z
    .string()
    .describe('Actionable and practical remediation steps to fix the security issue.'),
});
export type AISecurityExplanationOutput = z.infer<typeof AISecurityExplanationOutputSchema>;

export async function developerReceivesAISecurityExplanations(
  input: AISecurityExplanationInput
): Promise<AISecurityExplanationOutput> {
  return explainSecurityFindingFlow(input);
}

const explainSecurityFindingPrompt = ai.definePrompt({
  name: 'explainSecurityFindingPrompt',
  input: {schema: AISecurityExplanationInputSchema},
  output: {schema: AISecurityExplanationOutputSchema},
  prompt: `You are a security expert. Your task is to explain a security finding in plain English and provide practical remediation suggestions.

The explanation should be concise, clear, and easy for a developer to understand. Focus on the impact and risk.
The remediation suggestions should be actionable, specific steps to fix the issue, including best practices.

Security Finding Details:
Type: {{{findingType}}}
Severity: {{{severity}}}
Description: {{{description}}}
File Location: {{{fileLocation}}}
Code Snippet:
"""{{{codeSnippet}}}"""

Please provide a plain-English explanation and specific remediation suggestions based on the above finding.`,
});

const explainSecurityFindingFlow = ai.defineFlow(
  {
    name: 'explainSecurityFindingFlow',
    inputSchema: AISecurityExplanationInputSchema,
    outputSchema: AISecurityExplanationOutputSchema,
  },
  async input => {
    const {output} = await explainSecurityFindingPrompt(input);
    return output!;
  }
);
