/**
 * BotExample — discord-html-transcripts-v2 v4
 *
 * Usage:
 *   cp BotExample/.env.example BotExample/.env
 *   # fill in .env values
 *   pnpm bot:example
 */

import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  type Guild,
  type TextBasedChannel,
  type GuildBasedChannel,
} from 'discord.js';
import { createTranscript, ExportReturnType } from '../src/index.ts';

config({ path: path.resolve(__dirname, '.env') });

// ── Helpers ────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

function parseLimit(value: string | undefined): number {
  if (!value) return 500;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed === 0 || parsed < -1)
    throw new Error('MESSAGE_LIMIT must be a positive integer or -1 (fetch all).');
  return parsed;
}

async function resolveGuild(client: Client): Promise<Guild> {
  const guildId = process.env.GUILD_ID?.trim();

  if (guildId) return client.guilds.fetch(guildId);

  const guilds = await client.guilds.fetch();
  if (guilds.size !== 1)
    throw new Error('Set GUILD_ID when the bot belongs to more than one server.');

  const first = guilds.first();
  if (!first) throw new Error('The bot is not in any server.');
  return client.guilds.fetch(first.id);
}

function isTranscriptCandidate(
  channel: GuildBasedChannel
): channel is TextBasedChannel & GuildBasedChannel {
  return (
    channel.parentId !== null &&
    channel.isTextBased() &&
    'messages' in channel &&
    channel.type !== ChannelType.PublicThread &&
    channel.type !== ChannelType.PrivateThread &&
    channel.type !== ChannelType.AnnouncementThread
  );
}

async function pickChannel(guild: Guild): Promise<TextBasedChannel & GuildBasedChannel> {
  await guild.channels.fetch();

  // If a specific channel is set, use it directly
  const channelId = process.env.CHANNEL_ID?.trim();
  if (channelId) {
    const ch = guild.channels.cache.get(channelId);
    if (!ch || !isTranscriptCandidate(ch))
      throw new Error(`Channel ${channelId} not found or not a text channel.`);
    return ch;
  }

  const categoryId = process.env.CATEGORY_ID?.trim();
  const categoryName = process.env.CATEGORY_NAME?.trim();
  if (!categoryId && !categoryName)
    throw new Error('Set CHANNEL_ID, CATEGORY_ID, or CATEGORY_NAME in .env');

  const category = guild.channels.cache.find((ch) => {
    if (ch?.type !== ChannelType.GuildCategory) return false;
    if (categoryId) return ch.id === categoryId;
    return ch.name.toLowerCase() === categoryName!.toLowerCase();
  });

  if (!category) throw new Error('The configured category was not found.');

  const eligible = guild.channels.cache.filter(
    (ch): ch is TextBasedChannel & GuildBasedChannel =>
      !!ch && ch.parentId === category.id && isTranscriptCandidate(ch)
  );

  if (eligible.size === 0)
    throw new Error(`Category "${category.name}" has no eligible text channels.`);

  const arr = [...eligible.values()];
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const token = requireEnv('BOT_TOKEN');
  const limit = parseLimit(process.env.MESSAGE_LIMIT);
  const saveImages = parseBoolean(process.env.SAVE_IMAGES, false);
  const sendToChannel = parseBoolean(process.env.SEND_TO_SOURCE_CHANNEL, false);
  const outputDir = path.resolve(__dirname, process.env.OUTPUT_DIR?.trim() || './output');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once('ready', async () => {
    try {
      const guild = await resolveGuild(client);
      const channel = await pickChannel(guild);

      console.log(`Guild   : ${guild.name} (${guild.id})`);
      console.log(`Channel : #${channel.name} (${channel.id})`);

      const transcript = await createTranscript(channel, {
        returnType: ExportReturnType.String,
        filename: `transcript-${channel.id}.html`,
        limit,
        saveImages,
        sortType: 'ASC',
        poweredBy: true,
      });

      await mkdir(outputDir, { recursive: true });

      const safeName =
        channel.name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || channel.id;
      const filePath = path.join(outputDir, `${safeName}-${channel.id}.html`);

      await writeFile(filePath, transcript, 'utf8');
      console.log(`Transcript saved → ${filePath}`);

      if (sendToChannel) {
        await channel.send({
          content: `📄 Transcript generated for #${channel.name}`,
          files: [filePath],
        });
        console.log('Transcript uploaded to the source channel.');
      }

      await client.destroy();
      process.exit(0);
    } catch (error) {
      console.error(error);
      await client.destroy();
      process.exit(1);
    }
  });

  await client.login(token);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
