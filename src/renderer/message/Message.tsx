import {
  DiscordAttachments,
  DiscordCommand,
  DiscordMessage as DiscordMessageComponent,
  DiscordReaction,
  DiscordReactions,
  DiscordThread,
  DiscordThreadMessage,
} from '@derockdev/discord-components-react';
import { ComponentType, type Message as MessageType } from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from '../index';
import { parseDiscordEmoji } from '../../utils/utils';
import { Attachments } from './Attachment';
import ComponentRow, { ComponentsSlot } from '../components/index';
import MessageContent, { RenderType } from '../content/MessageContent';
import { DiscordEmbed } from '../embed/Embed';
import MessageReply from './Reply';
import SystemMessage from './SystemMessage';

function isComponentsV2Message(message: MessageType): boolean {
  if (!message.components.length) return false;

  const v2Types = new Set([
    ComponentType.Container,
    ComponentType.Section,
    ComponentType.MediaGallery,
    ComponentType.Separator,
    ComponentType.TextDisplay,
    ComponentType.File,
  ]);

  return !message.content && message.embeds.length === 0 && message.components.some((c) => v2Types.has(c.type));
}

export default async function DiscordMessage({
  message,
  context,
}: {
  message: MessageType;
  context: RenderMessageContext;
}) {
  if (message.system) return SystemMessage({ message });

  const isCrosspost = message.reference?.guildId !== message.guild?.id;
  const isV2 = isComponentsV2Message(message);
  const replyNode = await MessageReply({ message, context });
  const contentNode = message.content
    ? await MessageContent({
        content: message.content,
        context: {
          ...context,
          type: message.webhookId ? RenderType.WEBHOOK : RenderType.NORMAL,
        },
      })
    : null;
  const attachmentsNode = await Attachments({ message, context });
  const embedNodes = await Promise.all(
    message.embeds.map((embed, id) => DiscordEmbed({ embed, context: { ...context, index: id, message } }))
  );
  const v2ComponentNodes = await Promise.all(
    message.components.map((component, id) => ComponentRow({ id, component, context }))
  );
  const classicComponentsNode = await ComponentsSlot({ components: message.components, context });
  const threadPreviewNode =
    message.hasThread && message.thread?.lastMessage
      ? await MessageContent({
          content:
            message.thread.lastMessage.content.length > 128
              ? message.thread.lastMessage.content.slice(0, 125) + '…'
              : message.thread.lastMessage.content,
          context: { ...context, type: RenderType.REPLY },
        })
      : null;

  return (
    <DiscordMessageComponent
      id={`m-${message.id}`}
      timestamp={message.createdAt.toISOString()}
      key={message.id}
      edited={message.editedAt !== null}
      server={isCrosspost || undefined}
      highlight={message.mentions.everyone}
      profile={message.author.id}
    >
      {replyNode}

      {message.interaction && (
        <DiscordCommand
          slot="reply"
          profile={message.interaction.user.id}
          command={`/${message.interaction.commandName}`}
        />
      )}

      {!isV2 && (
        <>
          {contentNode}
          {attachmentsNode}
          {embedNodes}
        </>
      )}

      {message.components.length > 0 &&
        (isV2 ? <DiscordAttachments slot="components">{v2ComponentNodes}</DiscordAttachments> : classicComponentsNode)}

      {message.reactions.cache.size > 0 && (
        <DiscordReactions slot="reactions">
          {message.reactions.cache.map((reaction, id) => (
            <DiscordReaction
              key={`${message.id}r${id}`}
              name={reaction.emoji.name!}
              emoji={parseDiscordEmoji(reaction.emoji)}
              count={reaction.count}
            />
          ))}
        </DiscordReactions>
      )}

      {message.hasThread && message.thread && (
        <DiscordThread
          slot="thread"
          name={message.thread.name}
          cta={
            message.thread.messageCount
              ? `${message.thread.messageCount} Message${message.thread.messageCount > 1 ? 's' : ''}`
              : 'View Thread'
          }
        >
          {message.thread.lastMessage ? (
            <DiscordThreadMessage profile={message.thread.lastMessage.author.id}>
              {threadPreviewNode}
            </DiscordThreadMessage>
          ) : (
            'Thread messages not saved.'
          )}
        </DiscordThread>
      )}
    </DiscordMessageComponent>
  );
}
