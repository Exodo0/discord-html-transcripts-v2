import { version } from 'discord.js';
import debug from 'debug';

const log = debug('discord-html-transcripts:version');

/**
 * Warns (but never crashes the process) when discord.js version is unsupported.
 * v4 supports discord.js v14 and v15.
 */
export function checkDiscordJsVersion(): void {
  const major = version.split('.')[0];
  if (major === '14' || major === '15') {
    log(`discord.js v${version} — OK`);
    return;
  }

  console.warn(
    `[discord-html-transcripts] Warning: v4.x.x is designed for discord.js v14/v15. ` +
      `You are running v${version}. Some features may not work correctly.`
  );
}
