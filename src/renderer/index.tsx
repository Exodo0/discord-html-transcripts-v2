import { type Awaitable, type Channel, type Message, type Role, type User } from 'discord.js';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { renderToString } from '@derockdev/discord-components-core/hydrate';
import { buildProfiles } from '../utils/buildProfiles';
import { scrollToMessage, revealSpoiler } from '../static/client';
import TranscriptRoot from './transcript';
import type { ResolveImageCallback } from '../downloader/images';
import debug from 'debug';

const log = debug('discord-html-transcripts:renderer');

/**
 * The CDN version of @derockdev/discord-components-core to load client-side.
 * Kept as a build-time constant — no readFileSync at runtime.
 */
const DISCORD_COMPONENTS_VERSION = '^3.6.1';

// ── Context type (shared across renderers) ────────────────────────────────

export type RenderMessageContext = {
  messages: Message[];
  channel: Channel;

  callbacks: {
    resolveImageSrc: ResolveImageCallback;
    resolveChannel: (channelId: string) => Awaitable<Channel | null>;
    resolveUser: (userId: string) => Awaitable<User | null>;
    resolveRole: (roleId: string) => Awaitable<Role | null>;
  };

  poweredBy?: boolean;
  footerText?: string;
  /** Extra interpolation tokens for footerText */
  metadata?: Record<string, string>;
  saveImages: boolean;
  favicon: 'guild' | string;
  hydrate: boolean;
};

// ── Main render function ───────────────────────────────────────────────────

/**
 * Renders the full transcript HTML string from a RenderMessageContext.
 * Supports both client-side hydration (default) and full SSR.
 */
export default async function renderHtml({
  messages,
  channel,
  callbacks,
  ...options
}: RenderMessageContext): Promise<string> {
  log(`Rendering ${messages.length} messages (hydrate: ${options.hydrate})`);

  const profiles = buildProfiles(messages);

  const faviconHref =
    options.favicon === 'guild'
      ? channel.isDMBased()
        ? undefined
        : (channel.guild.iconURL({ size: 16, extension: 'png' }) ?? undefined)
      : options.favicon;

  const channelTitle = channel.isDMBased()
    ? 'Direct Messages'
    : (channel as { name?: string }).name ?? 'Transcript';

  const markup = '<!DOCTYPE html>' +
    renderToStaticMarkup(
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {faviconHref && <link rel="icon" type="image/png" href={faviconHref} />}
        <title>{channelTitle}</title>

        {/* Scroll-to-message handler (minified, no deps) */}
        <script dangerouslySetInnerHTML={{ __html: scrollToMessage }} />

        {!options.hydrate && (
          <>
            {/* User profile data for the component library */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.$discordMessage={profiles:${JSON.stringify(await profiles)}}`,
              }}
            />
            {/* Discord component library (ESM, from CDN) */}
            <script
              type="module"
              src={`https://cdn.jsdelivr.net/npm/@derockdev/discord-components-core@${DISCORD_COMPONENTS_VERSION}/dist/derockdev-discord-components-core/derockdev-discord-components-core.esm.js`}
            />
          </>
        )}
      </head>

      <body style={{ margin: 0, minHeight: '100vh' }}>
        <TranscriptRoot
          messages={messages}
          channel={channel}
          callbacks={callbacks}
          {...options}
        />
      </body>

      {/* Spoiler reveal script runs after DOM is ready (SSR mode only) */}
      {options.hydrate && (
        <script dangerouslySetInnerHTML={{ __html: revealSpoiler }} />
      )}
    </html>
  );

  if (options.hydrate) {
    log('Hydrating markup server-side');
    const result = await renderToString(markup, {
      beforeHydrate: async (document) => {
        (document.defaultView as unknown as { $discordMessage: unknown }).$discordMessage = {
          profiles: await profiles,
        };
      },
    });
    return result.html;
  }

  return markup;
}
