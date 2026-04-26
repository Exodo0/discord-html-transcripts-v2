# discord-html-transcripts-v2 &nbsp;![v4](https://img.shields.io/badge/version-4.0.0-blueviolet) ![discord.js](https://img.shields.io/badge/discord.js-v14%2Fv15-5865F2)

> Generate faithful, self-contained HTML transcripts from Discord channels.  
> Supports **classic messages** (content + embeds + ActionRows) **and V2 Component messages** (`ContainerBuilder` / `IsComponentsV2` flag) — automatically detected, no extra config needed.

---

## Installation

```bash
pnpm add discord-html-transcripts-v2
# or
npm install discord-html-transcripts-v2
```

> [!IMPORTANT]
> This package requires `discord.js`, `react`, and `react-dom` in the consuming project.
> They are declared as `peerDependencies`, so they are not installed automatically with `discord-html-transcripts-v2`.

**Required peer dependencies**:

```bash
pnpm add discord.js react@^18.2.0 react-dom@^18.2.0
# or
npm install discord.js react@^18.2.0 react-dom@^18.2.0
```

> [!TIP]
> Recommended one-shot install:
>
> ```bash
> pnpm add discord-html-transcripts-v2 discord.js react@^18.2.0 react-dom@^18.2.0
> ```

> `npm` equivalent:
>
> ```bash
> npm install discord-html-transcripts-v2 discord.js react@^18.2.0 react-dom@^18.2.0
> ```

> [!NOTE]
> Keeping `react` and `react-dom` as peer dependencies avoids bundling duplicate React copies into downstream bots and apps.

> [!WARNING]
> If you upgrade to `discord-html-transcripts-v2@4` without also having `react` and `react-dom` installed, or if you install React 19, installation may warn because upstream rendering dependencies currently target React 18.

> [!TIP]
> If your users report missing peer dependency warnings, tell them to install `react@^18.2.0` and `react-dom@^18.2.0` in the same project where they install `discord-html-transcripts-v2`.

---

## Quick Start

```ts
import * as transcripts from 'discord-html-transcripts-v2';

// Inside a Discord bot command / button handler:
const attachment = await transcripts.createTranscript(channel, {
  filename: `ticket-${channel.id}.html`,
  poweredBy: false,
  sortType: 'ASC',
});

await logChannel.send({ files: [attachment] });
```

> [!IMPORTANT]
> `createTranscript(channel, options)` remains the main entry point in v4.
> If your bot already uses the classic ticket transcript flow, you can usually upgrade without changing transcript-generation code.

---

## API

### `createTranscript(channel, options?)`

Fetches messages from a text channel and returns an HTML transcript.

| Option                  | Type                       | Default                           | Description                                                     |
| ----------------------- | -------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `returnType`            | `ExportReturnType`         | `Attachment`                      | `Attachment` \| `Buffer` \| `String`                            |
| `filename`              | `string`                   | `transcript-{id}.html`            | Output file name                                                |
| `limit`                 | `number`                   | `-1` (all)                        | Max messages to fetch                                           |
| `filter`                | `(msg) => boolean`         | —                                 | Filter messages before render                                   |
| `sortType`              | `'ASC' \| 'DESC'`          | `'ASC'`                           | Message sort order                                              |
| `includePinnedMessages` | `boolean`                  | `false`                           | Append pinned messages not in the main fetch                    |
| `saveImages`            | `boolean`                  | `false`                           | Download & inline images as base64                              |
| `poweredBy`             | `boolean`                  | `true`                            | Show "Powered by" footer link                                   |
| `footerText`            | `string`                   | `'Exported {number} message{s}.'` | Footer text. Supports `{number}`, `{s}`, and any `metadata` key |
| `metadata`              | `Record<string, string>`   | `{}`                              | Extra tokens for `footerText` interpolation                     |
| `favicon`               | `'guild' \| string`        | `'guild'`                         | Favicon URL or `'guild'` for guild icon                         |
| `hydrate`               | `boolean`                  | `false`                           | Full SSR (no CDN script needed)                                 |
| `callbacks`             | `Partial<RenderCallbacks>` | —                                 | Override channel/user/role/image resolvers                      |

### `generateFromMessages(messages, channel, options?)`

Same options as `createTranscript`, but takes an existing `Message[]` or `Collection<string, Message>` instead of fetching.

---

## V2 Components Support

Messages sent with `flags: 'IsComponentsV2'` (using `ContainerBuilder`, `SectionBuilder`, etc.) are **automatically detected** and rendered correctly — no extra config needed.

```ts
// This ticket message is automatically rendered as V2 in the transcript:
await channel.send({
  flags: 'IsComponentsV2',
  components: [
    new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('🎟️ Support Ticket'))
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(client.user.displayAvatarURL()))
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Danger)
        )
      ),
  ],
});
```

---

## Advanced: Image Downloader

```ts
import { TranscriptImageDownloader } from 'discord-html-transcripts-v2';

const attachment = await transcripts.createTranscript(channel, {
  callbacks: {
    resolveImageSrc: new TranscriptImageDownloader()
      .withMaxSize(2048) // KB — skip images larger than 2 MB
      .withTimeout(8000) // ms — fall back to URL after 8 s
      .withCompression(75, true) // quality 75, convert to WebP
      .build(),
  },
});
```

---

## Advanced: Footer with metadata

```ts
const attachment = await transcripts.createTranscript(channel, {
  footerText: 'Ticket: {channel} | Closed by: {closedBy} | Reason: {reason}',
  metadata: {
    channel: channel.name,
    closedBy: staffMember.user.tag,
    reason: closeReason ?? 'No reason provided.',
  },
  poweredBy: false,
});
```

---

## Debug Logging

```bash
DEBUG=discord-html-transcripts:* node your-bot.js
```

Individual namespaces:

| Namespace                                            | Description                 |
| ---------------------------------------------------- | --------------------------- |
| `discord-html-transcripts:renderer`                  | HTML render pipeline        |
| `discord-html-transcripts:generate`                  | Message transform & resolve |
| `discord-html-transcripts:createTranscript`          | Fetch loop                  |
| `discord-html-transcripts:TranscriptImageDownloader` | Image download              |

---

## Changelog

### v4.0.0

- **New architecture** — fully modular (`core/`, `renderer/`, `styles/`, `utils/`)
- **Auto-detection of V2 Component messages** — no config needed
- **`sortType`** option added to `CreateTranscriptOptions`
- **`includePinnedMessages`** option added
- **`metadata`** option for footer text interpolation
- **`ButtonStyle.Premium`** support added
- **`debug`** replaces all `console.log` calls — silent in production
- **Version check** no longer calls `process.exit(1)` — warns instead
- Build system migrated to **tsup** (CJS + ESM dual output)
- Removed runtime `readFileSync` of `package.json`
- All component files renamed (no more spaces in filenames)
- **Vitest** unit tests added

> [!CAUTION]
> Upgrading from `3.3.3` to `4.x` is usually source-compatible for `createTranscript(...)`, but you should still verify that your app has the required peer dependencies installed before publishing or deploying.
