import { describe, it, expect } from 'vitest';
import { calculateInlineIndex } from '../../src/utils/embeds';
import type { APIEmbedField } from 'discord.js';

function field(inline: boolean): APIEmbedField {
  return { name: 'n', value: 'v', inline };
}

describe('calculateInlineIndex', () => {
  it('returns 1 for the first field', () => {
    expect(calculateInlineIndex([field(true)], 0)).toBe(1);
  });

  it('returns 2 for the second consecutive inline field', () => {
    const fields = [field(true), field(true)];
    expect(calculateInlineIndex(fields, 1)).toBe(2);
  });

  it('returns 3 for the third consecutive inline field', () => {
    const fields = [field(true), field(true), field(true)];
    expect(calculateInlineIndex(fields, 2)).toBe(3);
  });

  it('wraps back to 1 after 3 inline fields', () => {
    const fields = [field(true), field(true), field(true), field(true)];
    expect(calculateInlineIndex(fields, 3)).toBe(1);
  });

  it('resets counter after a non-inline field', () => {
    const fields = [field(true), field(true), field(false), field(true)];
    expect(calculateInlineIndex(fields, 3)).toBe(1);
  });
});
