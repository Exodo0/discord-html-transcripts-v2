import type { Message, TextBasedChannel } from 'discord.js';
import type { CreateTranscriptOptions, ObjectType } from '../types';
import { ExportReturnType } from '../types';
import { generateFromMessages } from './generateFromMessages';
import debug from 'debug';

const log = debug('discord-html-transcripts:createTranscript');

/**
 * Fetches all messages from a text channel (up to `limit`) and generates an HTML transcript.
 *
 * @param channel - The channel to create the transcript from
 * @param options - Options controlling fetch behaviour and output format
 */
export async function createTranscript<T extends ExportReturnType = ExportReturnType.Attachment>(
  channel: TextBasedChannel,
  options: CreateTranscriptOptions<T> = {}
): Promise<ObjectType<T>> {
  if (!channel.isTextBased()) {
    throw new TypeError(
      `[discord-html-transcripts] createTranscript: expected a text-based channel, ` +
        `received type ${String((channel as Record<string, unknown>)['type'])}`
    );
  }

  const { limit, filter, sortType = 'ASC', includePinnedMessages = false } = options;
  const resolvedLimit = typeof limit === 'undefined' || limit === -1 ? Infinity : limit;

  let allMessages: Message[] = [];
  let lastMessageId: string | undefined;

  // ── Fetch loop ─────────────────────────────────────────────────────────────
  while (true) {
    const fetchOptions: { limit: number; before?: string } = { limit: 100 };
    if (lastMessageId) fetchOptions.before = lastMessageId;

    const batch = await channel.messages.fetch(fetchOptions);
    const filtered = typeof filter === 'function' ? batch.filter(filter) : batch;

    allMessages.push(...filtered.values());
    lastMessageId = batch.lastKey();

    if (batch.size < 100) break;
    if (allMessages.length >= resolvedLimit) break;
  }

  // ── Pinned messages ────────────────────────────────────────────────────────
  if (includePinnedMessages) {
    try {
      const pinned = await channel.messages.fetchPinned();
      const existingIds = new Set(allMessages.map((m) => m.id));
      const newPinned = pinned.filter((m) => !existingIds.has(m.id));
      allMessages.push(...newPinned.values());
      log(`Included ${newPinned.size} additional pinned messages`);
    } catch {
      log('Could not fetch pinned messages — skipping');
    }
  }

  // ── Trim to limit ──────────────────────────────────────────────────────────
  if (isFinite(resolvedLimit) && allMessages.length > resolvedLimit) {
    allMessages = allMessages.slice(0, resolvedLimit);
  }

  // ── Sort ───────────────────────────────────────────────────────────────────
  allMessages.sort((a, b) => {
    const diff = a.createdTimestamp - b.createdTimestamp;
    return sortType === 'DESC' ? -diff : diff;
  });

  log(`Fetched ${allMessages.length} messages (sort: ${sortType})`);

  return generateFromMessages<T>(allMessages, channel, options);
}
