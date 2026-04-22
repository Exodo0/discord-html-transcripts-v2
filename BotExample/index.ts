import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ChannelType, Client, GatewayIntentBits, Guild, TextBasedChannel, type GuildBasedChannel } from 'discord.js';
import { createTranscript, ExportReturnType } from '../src';

config({ path: path.resolve(__dirname, '.env') });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() === 'true';
}

function parseLimit(value: string | undefined): number {
  if (!value) return 500;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed === 0 || parsed < -1) {
    throw new Error('MESSAGE_LIMIT must be a positive integer or -1.');
  }

  return parsed;
}

async function resolveGuild(client: Client): Promise<Guild> {
  const guildId = process.env.GUILD_ID?.trim();

  if (guildId) {
    return client.guilds.fetch(guildId);
  }

  const guilds = await client.guilds.fetch();
  if (guilds.size !== 1) {
    throw new Error('Set GUILD_ID when the bot belongs to more than one server.');
  }

  const onlyGuild = guilds.first();
  if (!onlyGuild) {
    throw new Error('The bot is not in any server.');
  }

  return client.guilds.fetch(onlyGuild.id);
}

function isTranscriptCandidate(channel: GuildBasedChannel): channel is TextBasedChannel & GuildBasedChannel {
  return (
    channel.parentId !== null &&
    channel.isTextBased() &&
    'messages' in channel &&
    channel.type !== ChannelType.PublicThread &&
    channel.type !== ChannelType.PrivateThread &&
    channel.type !== ChannelType.AnnouncementThread
  );
}

async function pickRandomChannel(guild: Guild): Promise<TextBasedChannel & GuildBasedChannel> {
  await guild.channels.fetch();

  const categoryId = process.env.CATEGORY_ID?.trim();
  const categoryName = process.env.CATEGORY_NAME?.trim();

  if (!categoryId && !categoryName) {
    throw new Error('Set CATEGORY_ID or CATEGORY_NAME.');
  }

  const category = guild.channels.cache.find((channel) => {
    if (channel?.type !== ChannelType.GuildCategory) return false;
    if (categoryId) return channel.id === categoryId;
    return channel.name.toLowerCase() === categoryName!.toLowerCase();
  });

  if (!category) {
    throw new Error('The configured category was not found.');
  }

  const eligibleChannels = guild.channels.cache.filter(
    (channel): channel is TextBasedChannel & GuildBasedChannel =>
      !!channel && channel.parentId === category.id && isTranscriptCandidate(channel)
  );

  if (eligibleChannels.size === 0) {
    throw new Error(`Category "${category.name}" has no eligible text channels.`);
  }

  const channels = [...eligibleChannels.values()];
  return channels[Math.floor(Math.random() * channels.length)]!;
}

async function main(): Promise<void> {
  const token = requireEnv('BOT_TOKEN');
  const limit = parseLimit(process.env.MESSAGE_LIMIT);
  const saveImages = parseBoolean(process.env.SAVE_IMAGES, false);
  const sendToSourceChannel = parseBoolean(process.env.SEND_TO_SOURCE_CHANNEL, false);
  const configuredOutputDir = process.env.OUTPUT_DIR?.trim() || './output';
  const outputDir = path.resolve(__dirname, configuredOutputDir);

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  client.once('ready', async () => {
    try {
      const guild = await resolveGuild(client);
      const channel = await pickRandomChannel(guild);

      console.log(`Guild: ${guild.name} (${guild.id})`);
      console.log(`Random channel: #${channel.name} (${channel.id})`);

      const transcript = await createTranscript(channel, {
        returnType: ExportReturnType.String,
        filename: `transcript-${channel.id}.html`,
        limit,
        saveImages,
      });

      await mkdir(outputDir, { recursive: true });

      const safeChannelName = channel.name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || channel.id;
      const filePath = path.join(outputDir, `${safeChannelName}-${channel.id}.html`);

      await writeFile(filePath, transcript, 'utf8');
      console.log(`Transcript saved to ${filePath}`);

      if (sendToSourceChannel) {
        await channel.send({
          content: `Transcript generated for #${channel.name}`,
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

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
