'use server';
/**
 * @fileOverview Adapts the UI color scheme to match the organization context using GenAI.
 *
 * - adaptUIColorToOrgContext - A function that determines the appropriate UI color based on the organization context.
 * - AdaptUIColorToOrgContextInput - The input type for the adaptUIColorToOrgContext function.
 * - AdaptUIColorToOrgContextOutput - The return type for the adaptUIColorToOrgContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptUIColorToOrgContextInputSchema = z.object({
  organizationContext: z
    .string()
    .describe('The name or description of the organization context.'),
});
export type AdaptUIColorToOrgContextInput = z.infer<
  typeof AdaptUIColorToOrgContextInputSchema
>;

const AdaptUIColorToOrgContextOutputSchema = z.object({
  primaryColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the primary color for the UI.'
    ),
  backgroundColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the background color for the UI.'
    ),
  accentColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the accent color for the UI.'
    ),
});
export type AdaptUIColorToOrgContextOutput = z.infer<
  typeof AdaptUIColorToOrgContextOutputSchema
>;

export async function adaptUIColorToOrgContext(
  input: AdaptUIColorToOrgContextInput
): Promise<AdaptUIColorToOrgContextOutput> {
  return adaptUIColorToOrgContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptUIColorToOrgContextPrompt',
  input: {schema: AdaptUIColorToOrgContextInputSchema},
  output: {schema: AdaptUIColorToOrgContextOutputSchema},
  prompt: `Based on the organization context: {{{organizationContext}}}, determine appropriate UI colors that are consistent with the organization's identity.

Return the colors as hexadecimal color codes.

Consider the following UI style guidelines:

Primary color: Deep sky blue (#00BFFF) to evoke trust, authority, and openness.
Background color: Light gray (#E0E0E0) to provide a clean and neutral backdrop.
Accent color: Coral (#FF807A) for interactive elements, highlighting action items with a vibrant contrast.

Return a JSON object with "primaryColor", "backgroundColor", and "accentColor" fields.
`,
});

const adaptUIColorToOrgContextFlow = ai.defineFlow(
  {
    name: 'adaptUIColorToOrgContextFlow',
    inputSchema: AdaptUIColorToOrgContextInputSchema,
    outputSchema: AdaptUIColorToOrgContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
