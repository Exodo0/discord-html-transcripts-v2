import { DiscordActionRow, DiscordAttachment, DiscordSpoiler } from '@derockdev/discord-components-react';
import {
  ComponentType,
  type APIMessage,
  type Attachment as AttachmentType,
  type Message,
  type ThumbnailComponent,
  type MessageActionRowComponent,
  type TopLevelComponent,
} from 'discord.js';
import React from 'react';
import { parseDiscordEmoji } from '../../utils/utils';
import DiscordSelectMenu from './components/Select Menu';
import DiscordContainer from './components/Container';
import DiscordSection from './components/section/Section';
import DiscordMediaGallery from './components/Media Gallery';
import DiscordSeparator from './components/Spacing';
import DiscordButton from './components/Button';
import DiscordThumbnail from './components/Thumbnail';
import DiscordCheckbox from './components/Checkbox';
import DiscordRadioGroup from './components/RadioGroup';
import MessageContent from './content';
import { RenderType } from './content';
import type { RenderMessageContext } from '..';
import { ButtonStyleMapping } from './components/styles';

/**
 * Resolves a URL that might be an `attachment://` reference to an actual CDN URL.
 */
function resolveMediaUrl(url: string, attachments: Map<string, AttachmentType>): string {
  if (!url) return '';
  if (url.startsWith('attachment://')) {
    const filename = url.slice('attachment://'.length);
    for (const [, attachment] of attachments) {
      if (attachment.name === filename || attachment.url.includes(encodeURIComponent(filename))) {
        return attachment.url;
      }
    }
  }
  return url;
}

export default function ComponentRow({
  component,
  id,
  context,
  attachments,
  message,
}: {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
  attachments?: Map<string, AttachmentType>;
  message?: Message;
}) {
  switch (component.type) {
    case ComponentType.ActionRow:
      return (
        <div key={id} style={{ marginTop: '8px' }}>
          <DiscordActionRow>
            <>
              {(component.components ?? []).map((nestedComponent, id) => (
                <Component component={nestedComponent} id={id} key={id} attachments={attachments} />
              ))}
            </>
          </DiscordActionRow>
        </div>
      );

    case ComponentType.Container:
      return (
        <DiscordContainer key={id} accentColor={component.accentColor} spoiler={component.spoiler}>
          <>
            {(component.components ?? []).map((nestedComponent, id) => (
              <ComponentRow
                component={nestedComponent as TopLevelComponent}
                id={id}
                key={id}
                context={context}
                attachments={attachments}
                message={message}
              />
            ))}
          </>
        </DiscordContainer>
      );

    case ComponentType.File: {
      const fileUrl = resolveMediaUrl(component.file.url, attachments ?? new Map());
      return (
        <>
          {component.spoiler ? (
            <DiscordSpoiler key={component.id} slot="attachment">
              <DiscordAttachment
                type="file"
                key={component.id}
                slot="attachment"
                url={fileUrl}
                alt="Discord Attachment"
              />
            </DiscordSpoiler>
          ) : (
            <DiscordAttachment
              type="file"
              key={component.id}
              slot="attachment"
              url={fileUrl}
              alt="Discord Attachment"
            />
          )}
        </>
      );
    }

    case ComponentType.MediaGallery:
      return (
        <DiscordMediaGallery
          component={component}
          key={id}
          attachments={attachments ?? new Map()}
          resolveImageSrc={context.callbacks.resolveImageSrc}
          message={message?.toJSON() as APIMessage}
        />
      );

    case ComponentType.Section:
      return (
        <DiscordSection key={id} accessory={component.accessory} id={id} attachments={attachments}>
          {(component.components ?? []).map((nestedComponent, id) => (
            <ComponentRow
              component={nestedComponent as TopLevelComponent}
              id={id}
              key={id}
              context={context}
              attachments={attachments}
              message={message}
            />
          ))}
        </DiscordSection>
      );

    case ComponentType.Separator:
      return <DiscordSeparator key={id} spacing={component.spacing} divider={component.divider} />;

    case ComponentType.TextDisplay:
      return (
        <div
          key={id}
          className="discord-text-display"
          style={{
            fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.375rem',
            color: '#dbdee1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          <MessageContent content={component.content} context={{ ...context, type: RenderType.NORMAL }} />
        </div>
      );

    default:
      return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function Component({
  component,
  id,
  attachments,
}: {
  component: MessageActionRowComponent | ThumbnailComponent | { type: number; [key: string]: any };
  id: number;
  attachments?: Map<string, AttachmentType>;
}) {
  switch (component.type) {
    case ComponentType.Button:
      return (
        <DiscordButton
          key={id}
          type={ButtonStyleMapping[(component as any).style as keyof typeof ButtonStyleMapping]}
          url={(component as any).url ?? undefined}
          emoji={(component as any).emoji ? parseDiscordEmoji((component as any).emoji) : undefined}
        >
          {(component as any).label}
        </DiscordButton>
      );

    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return <DiscordSelectMenu key={id} component={component as any} />;

    case ComponentType.Thumbnail: {
      const thumbUrl = resolveMediaUrl((component as any).media.url, attachments ?? new Map());
      return (
        <DiscordThumbnail
          key={id}
          url={thumbUrl}
          description={(component as any).description ?? undefined}
          spoiler={(component as any).spoiler}
        />
      );
    }

    case ComponentType.Checkbox:
      return <DiscordCheckbox key={id} label={(component as any).label} checked={(component as any).value} />;

    case ComponentType.RadioGroup:
      return (
        <DiscordRadioGroup
          key={id}
          options={(component as any).options.map((opt: any) => ({
            label: opt.label,
            value: opt.value,
            description: opt.description ?? undefined,
          }))}
          defaultValues={(component as any).defaultValues}
        />
      );

    default:
      return undefined;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
