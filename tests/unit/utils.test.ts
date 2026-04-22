import { describe, it, expect } from 'vitest';
import { formatBytes, isDefined, numberToHexColor, parseDiscordEmoji } from '../../src/utils/utils';

describe('formatBytes', () => {
  it('handles zero', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('respects decimals param', () => {
    expect(formatBytes(1500, 0)).toBe('1 KB');
  });
});

describe('isDefined', () => {
  it('returns false for null', () => expect(isDefined(null)).toBe(false));
  it('returns false for undefined', () => expect(isDefined(undefined)).toBe(false));
  it('returns true for 0', () => expect(isDefined(0)).toBe(true));
  it('returns true for empty string', () => expect(isDefined('')).toBe(true));
  it('returns true for objects', () => expect(isDefined({})).toBe(true));
});

describe('numberToHexColor', () => {
  it('converts 0x5865f2 to #5865f2', () => {
    expect(numberToHexColor(0x5865f2)).toBe('#5865f2');
  });

  it('pads short values with leading zeros', () => {
    expect(numberToHexColor(0x000001)).toBe('#000001');
  });

  it('handles zero (black)', () => {
    expect(numberToHexColor(0)).toBe('#000000');
  });
});

describe('parseDiscordEmoji', () => {
  it('returns CDN URL for custom emoji with id', () => {
    const url = parseDiscordEmoji({ id: '123456', name: 'test', animated: false });
    expect(url).toBe('https://cdn.discordapp.com/emojis/123456.png');
  });

  it('returns animated CDN URL for animated custom emoji', () => {
    const url = parseDiscordEmoji({ id: '123456', name: 'test', animated: true });
    expect(url).toBe('https://cdn.discordapp.com/emojis/123456.gif');
  });

  it('returns twemoji CDN URL for unicode emoji', () => {
    // Simple heart emoji \u2764
    const url = parseDiscordEmoji({ id: null, name: '\u2764' });
    expect(url).toContain('cdnjs.cloudflare.com/ajax/libs/twemoji');
    expect(url.endsWith('.svg')).toBe(true);
  });
});
