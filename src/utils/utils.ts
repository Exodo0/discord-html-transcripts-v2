import type { APIMessageComponentEmoji, Emoji } from 'discord.js';
import twemoji from 'twemoji';

/**
 * Converts a Discord emoji object into a usable URL (CDN for custom, Twemoji CDN for standard).
 */
export function parseDiscordEmoji(emoji: Emoji | APIMessageComponentEmoji): string {
  if (emoji.id) {
    return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
  }

  const name = emoji.name ?? '';
  const sanitized = name.indexOf(String.fromCharCode(0x200d)) < 0 ? name.replace(/\uFE0F/g, '') : name;
  const codepoints = twemoji.convert.toCodePoint(sanitized).toLowerCase();

  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

/**
 * Converts a number of bytes into a human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Returns true when a value is not null or undefined.
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Converts a number colour (e.g. 0x5865f2) to a CSS hex string.
 */
export function numberToHexColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

