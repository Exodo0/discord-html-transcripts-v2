import type { APIEmbedField } from 'discord.js';

/**
 * Calculates the 1-based inline index for an embed field within a row of inline fields.
 * Discord displays up to 3 inline fields per row.
 */
export function calculateInlineIndex(fields: APIEmbedField[], currentFieldIndex: number): number {
  for (let i = currentFieldIndex - 1; i >= 0; i--) {
    const field = fields[i];
    if (!field) continue;
    if (field.inline === false) {
      return ((currentFieldIndex - 1 - i) % 3) + 1;
    }
  }
  return (currentFieldIndex % 3) + 1;
}
