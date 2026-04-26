import {
  DiscordEmbed as DiscordEmbedComponent,
  DiscordEmbedDescription,
  DiscordEmbedField,
  DiscordEmbedFields,
  DiscordEmbedFooter,
} from '@derockdev/discord-components-react';
import type { Embed, Message } from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from '../index';
import { calculateInlineIndex } from '../../utils/embeds';
import MessageContent, { RenderType } from '../content/MessageContent';

type RenderEmbedContext = RenderMessageContext & {
  index: number;
  message: Message;
};

export async function DiscordEmbed({ embed, context }: { embed: Embed; context: RenderEmbedContext }) {
  const key = `${context.message.id}-e-${context.index}`;
  const descriptionNode = embed.description
    ? await MessageContent({ content: embed.description, context: { ...context, type: RenderType.EMBED } })
    : null;
  const fieldNodes = await Promise.all(
    embed.fields.map(async (field, id) => {
      const fieldContent = await MessageContent({
        content: field.value,
        context: { ...context, type: RenderType.EMBED },
      });

      return (
        <DiscordEmbedField
          key={`${key}-f-${id}`}
          fieldTitle={field.name}
          inline={field.inline}
          inlineIndex={calculateInlineIndex(embed.fields, id)}
        >
          {fieldContent}
        </DiscordEmbedField>
      );
    })
  );

  return (
    <DiscordEmbedComponent
      embedTitle={embed.title ?? undefined}
      slot="embeds"
      key={key}
      authorImage={embed.author?.proxyIconURL ?? embed.author?.iconURL}
      authorName={embed.author?.name}
      authorUrl={embed.author?.url}
      color={embed.hexColor ?? undefined}
      image={embed.image?.proxyURL ?? embed.image?.url}
      thumbnail={embed.thumbnail?.proxyURL ?? embed.thumbnail?.url}
      url={embed.url ?? undefined}
    >
      {embed.description && <DiscordEmbedDescription slot="description">{descriptionNode}</DiscordEmbedDescription>}

      {embed.fields.length > 0 && <DiscordEmbedFields slot="fields">{fieldNodes}</DiscordEmbedFields>}

      {embed.footer && (
        <DiscordEmbedFooter
          slot="footer"
          footerImage={embed.footer.proxyIconURL ?? embed.footer.iconURL}
          timestamp={embed.timestamp ?? undefined}
        >
          {embed.footer.text}
        </DiscordEmbedFooter>
      )}
    </DiscordEmbedComponent>
  );
}
