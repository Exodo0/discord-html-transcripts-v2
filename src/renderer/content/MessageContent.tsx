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
import * as DiscordMarkdownParser from 'discord-markdown-parser';
import type { RuleTypesExtended } from 'discord-markdown-parser';
import { ChannelType, type APIMessageComponentEmoji } from 'discord.js';
import React from 'react';
import type { ASTNode, SingleASTNode } from 'simple-markdown';
import type { RenderMessageContext } from '../index';
import { parseDiscordEmoji } from '../../utils/utils';
import debug from 'debug';

const log = debug('discord-html-transcripts:content');

type DiscordTimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';
type DiscordMarkdownParse = (input: string, type?: 'normal' | 'extended') => ASTNode;

const parseMarkdown: DiscordMarkdownParse = (() => {
  if (typeof DiscordMarkdownParser === 'function') {
    return DiscordMarkdownParser as unknown as DiscordMarkdownParse;
  }

  if ('parse' in DiscordMarkdownParser && typeof DiscordMarkdownParser.parse === 'function') {
    return DiscordMarkdownParser.parse as DiscordMarkdownParse;
  }

  if ('default' in DiscordMarkdownParser && typeof DiscordMarkdownParser.default === 'function') {
    return DiscordMarkdownParser.default as DiscordMarkdownParse;
  }

  throw new TypeError('[discord-html-transcripts] Could not resolve discord-markdown-parser.');
})();

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

export default async function MessageContent({ content, context }: { content: string; context: RenderContentContext }) {
  const trimmed = context.type === RenderType.REPLY && content.length > 180 ? content.slice(0, 180) + '…' : content;

  const parsed = parseMarkdown(
    trimmed,
    context.type === RenderType.EMBED || context.type === RenderType.WEBHOOK ? 'extended' : 'normal'
  );

  const emojiNodes = parsed.filter((n: SingleASTNode) => n.type === 'emoji' || n.type === 'twemoji');
  const onlyEmojis = parsed.every(
    (n: SingleASTNode) => n.type === 'emoji' || n.type === 'twemoji' || (n.type === 'text' && !String(n.content).trim())
  );
  const largeEmojis = onlyEmojis && emojiNodes.length > 0 && emojiNodes.length <= 25;

  return await MessageASTNodeList({ nodes: parsed, context: { ...context, _internal: { largeEmojis } } });
}

async function MessageASTNodeList({
  nodes,
  context,
}: {
  nodes: ASTNode;
  context: RenderContentContext;
}): Promise<React.JSX.Element> {
  if (Array.isArray(nodes)) {
    const renderedNodes = await Promise.all(nodes.map((node) => MessageSingleASTNode({ node, context })));
    return (
      <>
        {renderedNodes.map((node, i) => (
          <React.Fragment key={i}>{node}</React.Fragment>
        ))}
      </>
    );
  }

  return <>{await MessageSingleASTNode({ node: nodes, context })}</>;
}

export async function MessageSingleASTNode({ node, context }: { node: SingleASTNode; context: RenderContentContext }) {
  if (!node) return null;

  const type = node.type as RuleTypesExtended;

  switch (type) {
    case 'text':
      return node.content as string;

    case 'link':
      return (
        <a href={node.target as string}>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</a>
      );

    case 'url':
    case 'autolink':
      return (
        <a href={node.target as string} target="_blank" rel="noreferrer">
          {await MessageASTNodeList({ nodes: node.content as ASTNode, context })}
        </a>
      );

    case 'blockQuote':
      if (context.type === RenderType.REPLY) {
        return await MessageASTNodeList({ nodes: node.content as ASTNode, context });
      }

      return <DiscordQuote>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</DiscordQuote>;

    case 'br':
    case 'newline':
      return context.type === RenderType.REPLY ? ' ' : <br />;

    case 'channel': {
      const id = node.id as string;
      const channel = await context.callbacks.resolveChannel(id);
      return (
        <DiscordMention type={channel ? (channel.isDMBased() ? 'channel' : getChannelType(channel.type)) : 'channel'}>
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
      return <DiscordMention type="user">{user ? (user.displayName ?? user.username) : `<@${id}>`}</DiscordMention>;
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
      return <DiscordItalic>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</DiscordItalic>;

    case 'strong':
      return <DiscordBold>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</DiscordBold>;

    case 'underline':
      return (
        <DiscordUnderlined>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</DiscordUnderlined>
      );

    case 'heading': {
      const rendered = await MessageASTNodeList({ nodes: node.content as ASTNode, context });
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
      return <s>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</s>;

    case 'emoticon':
      return await renderUnknown(node.content, context);

    case 'spoiler':
      return <DiscordSpoiler>{await MessageASTNodeList({ nodes: node.content as ASTNode, context })}</DiscordSpoiler>;

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
      return await renderUnknown(node.content, context);
  }
}

async function renderUnknown(content: unknown, context: RenderContentContext): Promise<React.ReactNode> {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return await MessageASTNodeList({ nodes: content as ASTNode, context });
  if (React.isValidElement(content)) return content;

  if (isLegacyElementLike(content)) {
    const props = content.props && typeof content.props === 'object' ? (content.props as Record<string, unknown>) : {};
    return React.createElement(content.type, { ...props, key: content.key ?? undefined });
  }

  if (content == null) return null;
  return String(content);
}

function isLegacyElementLike(
  value: unknown
): value is { type: React.ElementType; props?: unknown; key?: string | number | null } {
  return typeof value === 'object' && value !== null && 'type' in value && 'props' in value && '$$typeof' in value;
}

export function getChannelType(channelType: ChannelType): 'channel' | 'voice' | 'thread' | 'forum' {
  if (channelType === ChannelType.GuildVoice || channelType === ChannelType.GuildStageVoice) return 'voice';

  if (
    channelType === ChannelType.PublicThread ||
    channelType === ChannelType.PrivateThread ||
    channelType === ChannelType.AnnouncementThread
  ) {
    return 'thread';
  }

  if (channelType === ChannelType.GuildForum) return 'forum';
  return 'channel';
}
