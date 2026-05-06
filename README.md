# `discord-html-transcripts-v2`

[![npm](https://img.shields.io/npm/dw/discord-html-transcripts-v2)](http://npmjs.org/package/discord-html-transcripts-v2)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Exodo0/discord-html-transcripts-v2)
![GitHub Repo stars](https://img.shields.io/github/stars/Exodo0/discord-html-transcripts-v2?style=social)

Discord HTML Transcripts is a node.js module to generate nice looking HTML transcripts with full V2 Components support. Processes discord markdown like **bold**, _italics_, ~~strikethroughs~~, and more. Nicely formats attachments, embeds, and V2 display components. Built in XSS protection, preventing users from inserting arbitrary html tags.

This module can format the following:

- Discord flavored markdown
  - Uses discord-markdown-parser
  - Allows for complex markdown syntax to be parsed properly
- **V2 Display Components**
  - Container with accent color and spoiler support
  - Text Display
  - Section with Thumbnail/Button accessory
  - Media Gallery with spoiler support
  - File component
  - Separator
  - Checkbox and RadioGroup
- Embeds
- System messages
  - Join messages
  - Message Pins
  - Boost messages
- Slash commands
  - Will show the name of the command in the same style as Discord
- Buttons
- Reactions
- Attachments
  - Images, videos, audio, and generic files
  - Automatic image compression with `sharp` (optional)
- Replies
- Mentions
- Threads

**This module is designed to work with [discord.js](https://discord.js.org/#/) v14/v15 _only_.**

Behind the scenes, this package uses React SSR to generate a static site.

## 🖨️ Example Usage

### Using the built in message fetcher

```js
const discordTranscripts = require('discord-html-transcripts-v2');

const channel = message.channel;

const attachment = await discordTranscripts.createTranscript(channel, {
  saveImages: true, // Download and optimize images
});

channel.send({
  files: [attachment],
});
```

### Or if you prefer, you can pass in your own messages

```js
const discordTranscripts = require('discord-html-transcripts-v2');

const messages = someWayToGetMessages();
const channel = someWayToGetChannel();

const attachment = await discordTranscripts.generateFromMessages(messages, channel, {
  saveImages: true,
});

channel.send({
  files: [attachment],
});
```

## ⚙️ Configuration

Both methods of generating a transcript allow for an option object as the last parameter.
**All configuration options are optional!**

### Built in Message Fetcher

```js
const attachment = await discordTranscripts.createTranscript(channel, {
  limit: -1, // Max amount of messages to fetch. `-1` recursively fetches.
  returnType: 'attachment', // Valid options: 'buffer' | 'string' | 'attachment' Default: 'attachment'
  filename: 'transcript.html', // Only valid with returnType is 'attachment'. Name of attachment.
  saveImages: false, // Download all images and include the image data in the HTML
  footerText: 'Exported {number} message{s}', // Change text at footer
  poweredBy: true, // Whether to include the "Powered by" footer
  hydrate: true, // Whether to hydrate the html server-side
  filter: (message) => true, // Filter messages
});
```

### Image Optimization

When `saveImages` is `true`, images are automatically optimized:

- Resized to max 800x800px (maintaining aspect ratio)
- Compressed at 75% quality (requires `sharp`)
- Files > 10MB are skipped
- Videos are skipped (no width/height)

For custom compression:

```js
const { TranscriptImageDownloader } = require('discord-html-transcripts-v2');

callbacks: {
  resolveImageSrc: new TranscriptImageDownloader()
    .withMaxSize(5120) // 5MB in KB
    .withMaxDimensions(1200, 1200)
    .withCompression(60, true) // 60% quality, convert to webp
    .build(),
},
```

## 📄 License

Apache-2.0
