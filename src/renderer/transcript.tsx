import { DiscordHeader, DiscordMessages as DiscordMessagesComponent } from '@derockdev/discord-components-react';
import { ChannelType } from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from './index';
import { globalStyles } from '../styles/global';
import DiscordMessage from './message/Message';
import MessageContent, { RenderType } from './content/MessageContent';

/**
 * Root transcript component.
 * Renders the Discord-style header, all messages, and the footer.
 *
 * Requires `window.$discordMessage.profiles` to be set client-side (or via hydration).
 */
export default async function TranscriptRoot({ messages, channel, callbacks, ...options }: RenderMessageContext) {
  const guildName = channel.isDMBased() ? 'Direct Messages' : channel.guild.name;
  const channelName = channel.isDMBased()
    ? channel.type === ChannelType.DM
      ? (channel.recipient?.tag ?? 'Unknown Recipient')
      : 'Unknown Recipient'
    : channel.name;

  const guildIcon = channel.isDMBased() ? undefined : (channel.guild.iconURL({ size: 128 }) ?? undefined);

  const context: RenderMessageContext = { messages, channel, callbacks, ...options };
  const headerDescription = channel.isThread()
    ? `Thread channel in ${channel.parent?.name ?? 'Unknown Channel'}`
    : channel.isDMBased()
      ? 'Direct Messages'
      : channel.isVoiceBased()
        ? `Voice Text Channel for ${channel.name}`
        : channel.type === ChannelType.GuildCategory
          ? 'Category Channel'
          : 'topic' in channel && channel.topic
            ? await MessageContent({ content: channel.topic, context: { ...context, type: RenderType.REPLY } })
            : `This is the start of #${channel.name} channel.`;
  const renderedMessages = await Promise.all(messages.map((message) => DiscordMessage({ message, context })));

  return (
    <DiscordMessagesComponent style={{ minHeight: '100vh' }}>
      {/* Inject global CSS once */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* Channel header */}
      <DiscordHeader guild={guildName} channel={channelName} icon={guildIcon}>
        {headerDescription}
      </DiscordHeader>

      {/* Messages */}
      {renderedMessages}

      {/* Footer */}
      <Footer messages={messages} options={options} />
    </DiscordMessagesComponent>
  );
}

function Footer({
  messages,
  options,
}: {
  messages: RenderMessageContext['messages'];
  options: Omit<RenderMessageContext, 'messages' | 'channel' | 'callbacks'>;
}) {
  const count = messages.length;
  const { footerText = 'Exported {number} message{s}.', metadata = {}, poweredBy = true } = options;

  // Interpolate built-in tokens + user-supplied metadata
  const interpolated = Object.entries({ number: String(count), s: count !== 1 ? 's' : '', ...metadata }).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
    footerText
  );

  return (
    <div style={{ textAlign: 'center', width: '100%', padding: '8px 0' }}>
      {interpolated}
      {poweredBy && (
        <span style={{ textAlign: 'center' }}>
          {' '}
          Powered by:{' '}
          <a href="https://github.com/Exodo0/discord-html-transcripts-v2" style={{ color: 'lightblue' }}>
            discord-html-transcripts-v2
          </a>
          .
        </span>
      )}
    </div>
  );
}
