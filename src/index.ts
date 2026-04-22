/**
 * discord-html-transcripts-v2  —  v4.0.0
 *
 * Generates faithful, self-contained HTML transcripts from Discord channels.
 * Supports classic messages (content + embeds + ActionRows) and V2 Component
 * messages (ContainerBuilder / flags: 'IsComponentsV2').
 */

import { checkDiscordJsVersion } from './core/versionCheck';

// Run once at import time — warns (never crashes) on unsupported discord.js versions
checkDiscordJsVersion();

// ── Public API ─────────────────────────────────────────────────────────────

export { createTranscript } from './core/createTranscript';
export { generateFromMessages } from './core/generateFromMessages';

// Re-exports for advanced usage
export { default as TranscriptRoot } from './renderer/transcript';
export { default as renderHtml } from './renderer/index';
export { TranscriptImageDownloader } from './downloader/images';

// Types
export {
  ExportReturnType,
  type ObjectType,
  type GenerateFromMessagesOptions,
  type CreateTranscriptOptions,
  type AttachmentTypes,
} from './types';

export type { RenderMessageContext } from './renderer/index';
export type { Profile } from './utils/buildProfiles';
export type { ResolveImageCallback } from './downloader/images';
