import { DiscordReply } from '@derockdev/discord-components-react';
import { type Message, UserFlags } from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from '../index';
import MessageContent, { RenderType } from '../content/MessageContent';

export default async function MessageReply({ message, context }: { message: Message; context: RenderMessageContext }) {
  if (!message.reference) return null;
  if (message.reference.guildId !== message.guild?.id) return null;

  const referenced = context.messages.find((m) => m.id === message.reference!.messageId);

  if (!referenced) {
    return <DiscordReply slot="reply">Message could not be loaded.</DiscordReply>;
  }

  const isCrossPost = referenced.reference?.guildId !== message.guild?.id;
  const isCommand = referenced.interaction !== null;
  const replyContent = referenced.content
    ? await MessageContent({ content: referenced.content, context: { ...context, type: RenderType.REPLY } })
    : null;

  return (
    <DiscordReply
      slot="reply"
      edited={!isCommand && referenced.editedAt !== null}
      attachment={referenced.attachments.size > 0}
      author={referenced.member?.nickname ?? referenced.author.displayName ?? referenced.author.username}
      avatar={referenced.author.avatarURL({ size: 32 }) ?? undefined}
      roleColor={referenced.member?.displayHexColor ?? undefined}
      bot={!isCrossPost && referenced.author.bot}
      verified={referenced.author.flags?.has(UserFlags.VerifiedBot)}
      op={message.channel?.isThread?.() && referenced.author.id === (message.channel as { ownerId?: string }).ownerId}
      server={isCrossPost ?? undefined}
      command={isCommand}
    >
      {referenced.content ? (
        <span data-goto={referenced.id}>{replyContent}</span>
      ) : isCommand ? (
        <em data-goto={referenced.id}>Click to see command.</em>
      ) : (
        <em data-goto={referenced.id}>Click to see attachment.</em>
      )}
    </DiscordReply>
  );
}
