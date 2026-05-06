import {
  Client,
  GatewayIntentBits,
  Events,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  MessageFlags,
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

/**
 * Runs all component tests sequentially in the specified channel.
 * @param channel The text channel to send messages to.
 */
async function runAllTests(channel: TextChannel) {
  console.log(`Starting component tests in #${channel.name}...`);

  // --- Test 1: Basic Components (Action Row) ---
  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('primary_btn').setLabel('Primary').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('secondary_btn').setLabel('Secondary').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('success_btn').setLabel('Success').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('danger_btn').setLabel('Danger').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Link').setURL('https://discord.com').setStyle(ButtonStyle.Link).setEmoji('🔗')
  );

  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('string_select')
      .setPlaceholder('Make a selection!')
      .addOptions([
        { label: 'Option 1', description: 'The first option.', value: 'option_1', emoji: '1️⃣' },
        { label: 'Option 2', description: 'The second option.', value: 'option_2', emoji: '2️⃣' },
      ])
  );

  await channel.send({
    content: 'Testing standard buttons and a string select menu.',
    components: [buttons, selectMenu],
  });

  // --- Test 2: Media Gallery ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.MediaGallery,
            items: [
              { media: { url: 'https://placehold.co/400x800.png?text=Tall' }, description: 'Image 1' },
              { media: { url: 'https://placehold.co/400x400.png?text=Square+1' }, description: 'Image 2' },
              { media: { url: 'https://placehold.co/400x400.png?text=Square+2' }, description: 'Image 3' },
            ],
          },
        ],
      },
    ],
  });

  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.MediaGallery,
            items: [
              ...Array.from({ length: 10 }, (_, i) => ({
                media: { url: `https://placehold.co/300x300.png?text=Image+${i + 1}` },
                description: `Image ${i + 1}`,
              })),
            ],
          },
        ],
      },
    ],
  });

  // --- Test 3: Rich Layout Components ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: 'Hello world',
          },
          {
            type: ComponentType.Section,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: '**This is a Section Header**\nThis section has a button accessory.',
              },
            ],
            accessory: { type: ComponentType.Button, style: 1, label: 'Click Me', custom_id: 'section_btn_1' },
          },
          { type: ComponentType.Separator, divider: true, spacing: 2 },
          {
            type: ComponentType.Section,
            components: [
              { type: ComponentType.TextDisplay, content: 'This section has a `Thumbnail` with _markdown_.' },
            ],
            accessory: {
              type: ComponentType.Thumbnail,
              media: { url: 'https://placehold.co/85.png?text=Thumb' },
              description: 'A placeholder thumbnail',
            },
          },
          {
            type: ComponentType.ActionRow,
            components: [
              { type: ComponentType.Button, style: 2, label: 'Final Action', custom_id: 'final_action_btn' },
            ],
          },
        ],
      },
    ],
  });

  // --- Test 4: Container with accent color and spoiler ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        accent_color: 0x5865f2,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: 'This container has an **accent color** (blurple)!',
          },
        ],
      },
      {
        type: ComponentType.Container,
        spoiler: true,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: 'This container is **spoilered**! Click to reveal.',
          },
        ],
      },
    ],
  });

  // --- Test 5: Media Gallery with spoiler items ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**Gallery with spoiler items:**',
          },
          {
            type: ComponentType.MediaGallery,
            items: [
              { media: { url: 'https://placehold.co/400x200.png?text=Normal' }, description: 'Normal image' },
              {
                media: { url: 'https://placehold.co/400x200.png?text=Spoiler' },
                description: 'Spoiler image',
                spoiler: true,
              },
            ],
          },
        ],
      },
    ],
  });

  // --- Test 6: File component ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**File attachments in V2:**',
          },
          {
            type: ComponentType.File,
            file: { url: 'attachment://transcript-test.html' },
          },
        ],
      },
    ],
    files: [
      {
        attachment: Buffer.from('<html><body><h1>Test Transcript</h1></body></html>'),
        name: 'transcript-test.html',
      },
    ],
  });

  // --- Test 7: Checkbox component ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**Checkbox Components:**',
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Checkbox,
                label: 'I agree to the terms',
                value: true,
              },
            ],
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Checkbox,
                label: 'Subscribe to newsletter',
                value: false,
              },
            ],
          },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
  });

  // --- Test 8: RadioGroup component ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**Radio Group Component:**',
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.RadioGroup,
                options: [
                  { label: 'Option A', value: 'a', description: 'The first option' },
                  { label: 'Option B', value: 'b', description: 'The second option' },
                  { label: 'Option C', value: 'c', description: 'The third option' },
                ],
                default_values: ['b'],
              },
            ],
          },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
  });

  // --- Test 9: Nested containers ---
  await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        accent_color: 0x57f287,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**Outer Container** (green accent)',
          },
          {
            type: ComponentType.Separator,
            divider: true,
            spacing: 1,
          },
          {
            type: ComponentType.Section,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: 'This section has a thumbnail accessory.',
              },
              {
                type: ComponentType.TextDisplay,
                content: 'With *multiple* text displays!',
              },
            ],
            accessory: {
              type: ComponentType.Thumbnail,
              media: { url: 'https://placehold.co/85.png?text=Section+Thumb' },
              description: 'Section thumbnail',
            },
          },
        ],
      },
    ],
  });

  console.log('Sent all test messages.');
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);

  const channelId = process.env.CHANNEL;
  if (!channelId) {
    console.error('Error: CHANNEL environment variable is not set.');
    process.exit(1);
  }

  try {
    const channel = await client.channels.fetch(channelId);

    if (channel && channel instanceof TextChannel) {
      await runAllTests(channel);
    } else {
      console.error(`Could not find channel with ID ${channelId}, or it is not a text channel.`);
    }
  } catch (error) {
    console.error('Failed to run tests:', error);
  } finally {
    console.log('Shutting down bot.');
    client.destroy();
  }
});

const token = process.env.TOKEN;
if (!token) {
  console.error('Error: TOKEN environment variable is not set.');
  process.exit(1);
}

client.login(token);
