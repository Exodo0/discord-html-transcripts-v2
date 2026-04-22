import {
  DiscordBold,
  DiscordCodeBlock,
  DiscordCustomEmoji,
  DiscordInlineCode,
  DiscordItalic,
  DiscordMention,
  DiscordQuote,
  DiscordSpoiler,
  DiscordTime,
  DiscordUnderlined,
} from '@derockdev/discord-components-react';
import parse, { type RuleTypesExtended } from 'discord-markdown-parser';
import { ChannelType, type APIMessageComponentEmoji } from 'discord.js';
import React from 'react';
import type { ASTNode, SingleASTNode } from 'simple-markdown';
import type { RenderMessageContext } from '../index';
import { parseDiscordEmoji } from '../../utils/utils';
import debug from 'debug';

const log = debug('discord-html-transcripts:content');

type DiscordTimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

// ── Render mode ────────────────────────────────────────────────────────────

export enum RenderType {
  EMBED,
  REPLY,
  NORMAL,
  WEBHOOK,
}

type RenderContentContext = RenderMessageContext & {
  type: RenderType;
  _internal?: { largeEmojis?: boolean };
};

// ── Root content renderer ─────────────────────────────────────────────────

/**
 * Parses a Discord markdown string and renders it to React nodes.
 */
export default async function MessageContent({
  content,
  context,
}: {
  content: string;
  context: RenderContentContext;
}) {
  const trimmed =
    context.type === RenderType.REPLY && content.length > 180
      ? content.slice(0, 180) + '…'
      : content;

  const parsed = parse(
    trimmed,
    context.type === RenderType.EMBED || context.type === RenderType.WEBHOOK ? 'extended' : 'normal'
  );

  // Large emoji detection: only emojis (and whitespace) in the message + ≤ 25 of them
  const emojiNodes = parsed.filter((n) => n.type === 'emoji' || n.type === 'twemoji');
  const onlyEmojis = parsed.every(
    (n) => n.type === 'emoji' || n.type === 'twemoji' || (n.type === 'text' && !n.content.trim())
  );
  const largeEmojis = onlyEmojis && emojiNodes.length > 0 && emojiNodes.length <= 25;

  return (
    <MessageASTNodeList
      nodes={parsed}
      context={{ ...context, _internal: { largeEmojis } }}
    />
  );
}

// ── Node list ─────────────────────────────────────────────────────────────

async function MessageASTNodeList({
  nodes,
  context,
}: {
  nodes: ASTNode;
  context: RenderContentContext;
}): Promise<React.JSX.Element> {
  if (Array.isArray(nodes)) {
    return (
      <>
        {nodes.map((node, i) => (
          <MessageSingleASTNode node={node} context={context} key={i} />
        ))}
      </>
    );
  }
  return <MessageSingleASTNode node={nodes} context={context} />;
}

// ── Single node renderer ──────────────────────────────────────────────────

export async function MessageSingleASTNode({
  node,
  context,
}: {
  node: SingleASTNode;
  context: RenderContentContext;
}) {
  if (!node) return null;

  const type = node.type as RuleTypesExtended;

  switch (type) {
    case 'text':
      return node.content as string;

    case 'link':
      return (
        <a href={node.target as string}>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </a>
      );

    case 'url':
    case 'autolink':
      return (
        <a href={node.target as string} target="_blank" rel="noreferrer">
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </a>
      );

    case 'blockQuote':
      if (context.type === RenderType.REPLY) {
        return <MessageASTNodeList nodes={node.content as ASTNode} context={context} />;
      }
      return (
        <DiscordQuote>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </DiscordQuote>
      );

    case 'br':
    case 'newline':
      return context.type === RenderType.REPLY ? ' ' : <br />;

    case 'channel': {
      const id = node.id as string;
      const channel = await context.callbacks.resolveChannel(id);
      return (
        <DiscordMention
          type={channel ? (channel.isDMBased() ? 'channel' : getChannelType(channel.type)) : 'channel'}
        >
          {channel ? (channel.isDMBased() ? 'DM Channel' : (channel as { name?: string }).name) : `<#${id}>`}
        </DiscordMention>
      );
    }

    case 'role': {
      const id = node.id as string;
      const role = await context.callbacks.resolveRole(id);
      return (
        <DiscordMention type="role" color={context.type === RenderType.REPLY ? undefined : role?.hexColor}>
          {role ? role.name : `<@&${id}>`}
        </DiscordMention>
      );
    }

    case 'user': {
      const id = node.id as string;
      const user = await context.callbacks.resolveUser(id);
      return (
        <DiscordMention type="user">
          {user ? (user.displayName ?? user.username) : `<@${id}>`}
        </DiscordMention>
      );
    }

    case 'here':
    case 'everyone':
      return (
        <DiscordMention type="role" highlight>
          {`@${type}`}
        </DiscordMention>
      );

    case 'codeBlock':
      if (context.type === RenderType.REPLY) {
        return <DiscordInlineCode>{node.content as string}</DiscordInlineCode>;
      }
      return <DiscordCodeBlock language={node.lang as string} code={node.content as string} />;

    case 'inlineCode':
      return <DiscordInlineCode>{node.content as string}</DiscordInlineCode>;

    case 'em':
      return (
        <DiscordItalic>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </DiscordItalic>
      );

    case 'strong':
      return (
        <DiscordBold>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </DiscordBold>
      );

    case 'underline':
      return (
        <DiscordUnderlined>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </DiscordUnderlined>
      );

    case 'heading': {
      const rendered = <MessageASTNodeList nodes={node.content as ASTNode} context={context} />;
      if (context.type === RenderType.REPLY) return rendered;
      if ((node.level as number) <= 2) {
        return (
          <>
            <DiscordBold>{rendered}</DiscordBold>
            <br />
          </>
        );
      }
      return (
        <>
          {rendered}
          <br />
        </>
      );
    }

    case 'strikethrough':
      return (
        <s>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </s>
      );

    case 'emoticon':
      return renderUnknown(node.content, context);

    case 'spoiler':
      return (
        <DiscordSpoiler>
          <MessageASTNodeList nodes={node.content as ASTNode} context={context} />
        </DiscordSpoiler>
      );

    case 'emoji':
    case 'twemoji':
      return (
        <DiscordCustomEmoji
          name={node.name as string}
          url={parseDiscordEmoji(node as APIMessageComponentEmoji)}
          embedEmoji={context.type === RenderType.EMBED}
          largeEmoji={context._internal?.largeEmojis}
        />
      );

    case 'timestamp':
      return (
        <DiscordTime
          timestamp={parseInt(node.timestamp as string) * 1000}
          format={node.format as DiscordTimestampFormat | undefined}
        />
      );

    default:
      log(`Unknown node type: ${type}`, node);
      return renderUnknown(node.content, context);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function renderUnknown(content: unknown, context: RenderContentContext): React.ReactNode {
  if (typeof content === 'string') return content;
  if (Array.isArray(content))
    return <MessageASTNodeList nodes={content as ASTNode} context={context} />;
  if (React.isValidElement(content)) return content;

  // Handle legacy React-element-like objects from the parser
  if (isLegacyElementLike(content)) {
    const props =
      content.props && typeof content.props === 'object'
        ? (content.props as Record<string, unknown>)
        : {};
    return React.createElement(content.type, { ...props, key: content.key ?? undefined });
  }

  if (content == null) return null;
  return String(content);
}

function isLegacyElementLike(
  value: unknown
): value is { type: React.ElementType; props?: unknown; key?: string | number | null } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'props' in value &&
    '$$typeof' in value
  );
}

export function getChannelType(
  channelType: ChannelType
): 'channel' | 'voice' | 'thread' | 'forum' {
  switch (channelType) {
    case ChannelType.GuildVoice:
    case ChannelType.GuildStageVoice:
      return 'voice';
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread:
    case ChannelType.AnnouncementThread:
      return 'thread';
    case ChannelType.GuildForum:
      return 'forum';
    default:
      return 'channel';
  }
}
