# `discord-html-transcripts-v2`

[![npm](https://img.shields.io/npm/dw/discord-html-transcripts-v2)](http://npmjs.org/package/discord-html-transcripts-v2)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Exodo0/discord-html-transcripts-v2)
![GitHub Repo stars](https://img.shields.io/github/stars/Exodo0/discord-html-transcripts-v2?style=social)

Discord HTML Transcripts is a node.js module to generate nice looking HTML transcripts. Processes discord markdown like **bold**, _italics_, ~~strikethroughs~~, and more. Nicely formats attachments and embeds. Built in XSS protection, preventing users from inserting arbitrary html tags.

This package is a community-maintained fork published as `discord-html-transcripts-v2`.

This module can format the following:

- Discord flavored markdown
  - Uses [discord-markdown-parser](https://github.com/ItzDerock/discord-markdown-parser)
  - Allows for complex markdown syntax to be parsed properly
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
- Replies
- Mentions
- Threads

**This module is designed to work with [discord.js](https://discord.js.org/#/) v14/v15 _only_. If you need v13 support, roll back to v2.X.X**

Styles from [@derockdev/discord-components](https://github.com/ItzDerock/discord-components).
Behind the scenes, this package uses React SSR to generate a static site.

