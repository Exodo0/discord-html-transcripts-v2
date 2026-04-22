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

/**
 * Returns true when a message was sent with the IsComponentsV2 flag,
 * meaning the body is entirely composed of top-level V2 components
 * (Container, Section, MediaGallery, etc.) with no classic content/embeds.
 */
function isComponentsV2Message(message: MessageType): boolean {
  if (!message.components.length) return false;
  // V2 messages: content is empty AND embeds are empty AND at least one
  // top-level component is a V2 type (Container, Section, MediaGallery, Separator, TextDisplay, File)
  const v2Types = new Set([
    ComponentType.Container,
    ComponentType.Section,
    ComponentType.MediaGallery,
    ComponentType.Separator,
    ComponentType.TextDisplay,
    ComponentType.File,
  ]);
  return (
    !message.content &&
    message.embeds.length === 0 &&
    message.components.some((c) => v2Types.has(c.type))
  );
}

/**
 * Renders a single Discord message with all its sub-elements:
 * reply, slash-command indicator, content, attachments, embeds, components, reactions, threads.
 *
 * Automatically detects V2 Component messages (ContainerBuilder / IsComponentsV2)
 * and renders them via the ComponentsSlot — no extra config needed.
 */
export default async function DiscordMessage({
  message,
  context,
}: {
  message: MessageType;
  context: RenderMessageContext;
}) {
  // System messages have their own renderer
  if (message.system) return <SystemMessage message={message} />;

  const isCrosspost = message.reference?.guildId !== message.guild?.id;
  const isV2 = isComponentsV2Message(message);

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
      {/* Reply reference */}
      <MessageReply message={message} context={context} />

      {/* Slash command indicator */}
      {message.interaction && (
        <DiscordCommand
          slot="reply"
          profile={message.interaction.user.id}
          command={`/${message.interaction.commandName}`}
        />
      )}

      {/* ── Classic message body ───────────────────────────────────────── */}
      {!isV2 && (
        <>
          {message.content && (
            <MessageContent
              content={message.content}
              context={{
                ...context,
                type: message.webhookId ? RenderType.WEBHOOK : RenderType.NORMAL,
              }}
            />
          )}

          {/* Attachments */}
          <Attachments message={message} context={context} />

          {/* Embeds */}
          {message.embeds.map((embed, id) => (
            <DiscordEmbed
              key={id}
              embed={embed}
              context={{ ...context, index: id, message }}
            />
          ))}
        </>
      )}

      {/* ── Components (V2 full-body or classic ActionRows) ───────────── */}
      {message.components.length > 0 && (
        isV2 ? (
          /* V2: components ARE the message body */
          <DiscordAttachments slot="components">
            {message.components.map((component, id) => (
              <ComponentRow key={id} id={id} component={component} context={context} />
            ))}
          </DiscordAttachments>
        ) : (
          /* Classic: ActionRows below the message content */
          <ComponentsSlot components={message.components} context={context} />
        )
      )}

      {/* Reactions */}
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

      {/* Thread preview */}
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
              <MessageContent
                content={
                  message.thread.lastMessage.content.length > 128
                    ? message.thread.lastMessage.content.slice(0, 125) + '…'
                    : message.thread.lastMessage.content
                }
                context={{ ...context, type: RenderType.REPLY }}
              />
            </DiscordThreadMessage>
          ) : (
            'Thread messages not saved.'
          )}
        </DiscordThread>
      )}
    </DiscordMessageComponent>
  );
}
