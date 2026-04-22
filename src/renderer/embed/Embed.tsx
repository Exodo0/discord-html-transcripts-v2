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

/**
 * Renders a single Discord Embed with title, author, colour, image, thumbnail,
 * description, fields, and footer.
 */
export async function DiscordEmbed({
  embed,
  context,
}: {
  embed: Embed;
  context: RenderEmbedContext;
}) {
  const key = `${context.message.id}-e-${context.index}`;

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
      {/* Description */}
      {embed.description && (
        <DiscordEmbedDescription slot="description">
          <MessageContent
            content={embed.description}
            context={{ ...context, type: RenderType.EMBED }}
          />
        </DiscordEmbedDescription>
      )}

      {/* Fields */}
      {embed.fields.length > 0 && (
        <DiscordEmbedFields slot="fields">
          {embed.fields.map((field, id) => (
            <DiscordEmbedField
              key={`${key}-f-${id}`}
              fieldTitle={field.name}
              inline={field.inline}
              inlineIndex={calculateInlineIndex(embed.fields, id)}
            >
              <MessageContent
                content={field.value}
                context={{ ...context, type: RenderType.EMBED }}
              />
            </DiscordEmbedField>
          ))}
        </DiscordEmbedFields>
      )}

      {/* Footer */}
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
