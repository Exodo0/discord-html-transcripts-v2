import type { AttachmentBuilder, Message } from 'discord.js';
import type { RenderMessageContext } from './renderer';

// ── Attachment ─────────────────────────────────────────────────────────────

export type AttachmentTypes = 'audio' | 'video' | 'image' | 'file';

// ── Return type enum ───────────────────────────────────────────────────────

export enum ExportReturnType {
  Buffer = 'buffer',
  String = 'string',
  Attachment = 'attachment',
}

export type ObjectType<T extends ExportReturnType> = T extends ExportReturnType.Buffer
  ? Buffer
  : T extends ExportReturnType.String
    ? string
    : AttachmentBuilder;

// ── Options ────────────────────────────────────────────────────────────────

/**
 * Options shared between generateFromMessages and createTranscript.
 */
export type GenerateFromMessagesOptions<T extends ExportReturnType> = Partial<{
  /**
   * The type of object to return.
   * @default ExportReturnType.Attachment
   */
  returnType: T;

  /**
   * Downloads images and encodes them as base64 data URLs so the HTML is self-contained.
   * Uses TranscriptImageDownloader internally unless you supply callbacks.resolveImageSrc.
   * @default false
   */
  saveImages: boolean;

  /**
   * Override individual resolution callbacks.
   */
  callbacks: Partial<RenderMessageContext['callbacks']>;

  /**
   * File name used when returnType is Attachment.
   * @default 'transcript-{channel-id}.html'
   */
  filename: string;

  /**
   * Whether to render the "Powered by discord-html-transcripts" footer link.
   * @default true
   */
  poweredBy: boolean;

  /**
   * Text shown above the powered-by line.
   * Supports tokens: {number}, {s}, and any key from `metadata`.
   * @default 'Exported {number} message{s}.'
   */
  footerText: string;

  /**
   * Extra key-value pairs that are interpolated into footerText.
   * Example: metadata: { closedBy: 'Admin' } → footerText: 'Closed by {closedBy}'
   * @default {}
   */
  metadata: Record<string, string>;

  /**
   * Favicon shown in the browser tab.
   * 'guild' uses the guild icon; any other string is used as a URL.
   * @default 'guild'
   */
  favicon: 'guild' | string;

  /**
   * When true the HTML is rendered server-side (SSR / hydrated).
   * When false (default) the component library boots client-side via a CDN script tag.
   * @default false
   */
  hydrate: boolean;
}>;

/**
 * Extended options for createTranscript (adds fetch controls on top of generate options).
 */
export type CreateTranscriptOptions<T extends ExportReturnType> = GenerateFromMessagesOptions<T> &
  Partial<{
    /**
     * Maximum number of messages to include.
     * Use -1 (or omit) to fetch all available messages.
     * @default -1 (all)
     */
    limit: number;

    /**
     * Predicate to filter messages before inclusion.
     * Only messages for which the predicate returns true are included.
     */
    filter: (message: Message<boolean>) => boolean;

    /**
     * Order in which messages are rendered.
     * @default 'ASC'
     */
    sortType: 'ASC' | 'DESC';

    /**
     * When true, pinned messages that were not fetched in the main loop are appended.
     * @default false
     */
    includePinnedMessages: boolean;
  }>;
