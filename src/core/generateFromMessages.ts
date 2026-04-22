import { AttachmentBuilder, type Collection, type Channel, type Message } from 'discord.js';
import type { GenerateFromMessagesOptions, ObjectType } from '../types';
import { ExportReturnType } from '../types';
import { TranscriptImageDownloader, type ResolveImageCallback } from '../downloader/images';
import renderHtml from '../renderer';
import debug from 'debug';

const log = debug('discord-html-transcripts:generate');

/**
 * Generates an HTML transcript from an array or Collection of messages.
 *
 * @param messages - Messages to include in the transcript
 * @param channel  - The channel the messages originate from (used for header / guild info)
 * @param options  - Generation options
 */
export async function generateFromMessages<T extends ExportReturnType = ExportReturnType.Attachment>(
  messages: Message[] | Collection<string, Message>,
  channel: Channel,
  options: GenerateFromMessagesOptions<T> = {}
): Promise<ObjectType<T>> {
  const transformedMessages = messages instanceof Map ? Array.from(messages.values()) : (messages as Message[]);

  log(
    `Generating transcript for ${transformedMessages.length} messages in ` +
      `${channel.isDMBased() ? 'DM' : (channel as { name?: string }).name ?? channel.id}`
  );

  // ── Image resolver ─────────────────────────────────────────────────────────
  let resolveImageSrc: ResolveImageCallback =
    options.callbacks?.resolveImageSrc ?? ((attachment) => attachment.url);

  if (options.saveImages) {
    if (options.callbacks?.resolveImageSrc) {
      console.warn(
        '[discord-html-transcripts] Both saveImages and callbacks.resolveImageSrc were provided. ' +
          'resolveImageSrc takes precedence — saveImages is ignored.'
      );
    } else {
      log('Using default TranscriptImageDownloader');
      resolveImageSrc = new TranscriptImageDownloader().build();
    }
  }

  // ── Build role resolver (DM channels have no guild) ───────────────────────
  const resolveRole = channel.isDMBased()
    ? () => Promise.resolve(null)
    : async (id: string) => {
        try {
          return await (
            channel as unknown as { guild: { roles: { fetch: (id: string) => Promise<import('discord.js').Role | null> } } }
          ).guild.roles.fetch(id);
        } catch {
          return null;
        }
      };

  // ── Render ─────────────────────────────────────────────────────────────────
  const html = await renderHtml({
    messages: transformedMessages,
    channel,
    saveImages: options.saveImages ?? false,
    callbacks: {
      resolveImageSrc,
      resolveChannel: async (id) => channel.client.channels.fetch(id).catch(() => null),
      resolveUser: async (id) => channel.client.users.fetch(id).catch(() => null),
      resolveRole,
      // User-supplied overrides always win
      ...(options.callbacks ?? {}),
    },
    poweredBy: options.poweredBy ?? true,
    footerText: options.footerText ?? 'Exported {number} message{s}.',
    favicon: options.favicon ?? 'guild',
    hydrate: options.hydrate ?? false,
    metadata: options.metadata ?? {},
  });

  log(`Render complete (${html.length} bytes)`);

  // ── Return type ────────────────────────────────────────────────────────────
  if (options.returnType === ExportReturnType.Buffer) {
    return Buffer.from(html) as unknown as ObjectType<T>;
  }

  if (options.returnType === ExportReturnType.String) {
    return html as unknown as ObjectType<T>;
  }

  return new AttachmentBuilder(Buffer.from(html), {
    name: options.filename ?? `transcript-${channel.id}.html`,
  }) as unknown as ObjectType<T>;
}
