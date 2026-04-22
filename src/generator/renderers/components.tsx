import { DiscordActionRow, DiscordAttachment, DiscordSpoiler } from '@derockdev/discord-components-react';
import {
  ComponentType,
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
import MessageContent from './content';
import { RenderType } from './content';
import type { RenderMessageContext } from '..';
import { ButtonStyleMapping } from './components/styles';

export default function ComponentRow({
  component,
  id,
  context,
}: {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
}) {
  switch (component.type) {
    case ComponentType.ActionRow:
      return (
        <DiscordActionRow key={id}>
          <>
            {component.components.map((nestedComponent, id) => (
              <Component component={nestedComponent} id={id} key={id} />
            ))}
          </>
        </DiscordActionRow>
      );

    case ComponentType.Container:
      return (
        <DiscordContainer
          key={id}
          accentColor={
            'accentColor' in component ? ((component.accentColor as number | undefined) ?? undefined) : undefined
          }
        >
          <>
            {component.components.map((nestedComponent, id) => (
              <ContainerChild component={nestedComponent} id={id} key={id} context={context} />
            ))}
          </>
        </DiscordContainer>
      );

    case ComponentType.File:
      return (
        <>
          {component.spoiler ? (
            <DiscordSpoiler key={component.id} slot="attachment">
              <DiscordAttachment
                type="file"
                key={component.id}
                slot="attachment"
                url={component.file.url}
                alt="Discord Attachment"
              />
            </DiscordSpoiler>
          ) : (
            <DiscordAttachment
              type="file"
              key={component.id}
              slot="attachment"
              url={component.file.url}
              alt="Discord Attachment"
            />
          )}
        </>
      );

    case ComponentType.MediaGallery:
      return <DiscordMediaGallery component={component} key={id} />;

    case ComponentType.Section:
      return (
        <DiscordSection key={id} accessory={component.accessory} id={id}>
          {/* Section children (TextDisplay, etc.) go through ContainerChild so each
              type is rendered correctly with the right padding/context */}
          {component.components.map((nestedComponent, nestedId) => (
            <ContainerChild component={nestedComponent} id={nestedId} key={nestedId} context={context} />
          ))}
        </DiscordSection>
      );

    case ComponentType.Separator:
      return <DiscordSeparator key={id} spacing={component.spacing} divider={component.divider} />;

    case ComponentType.TextDisplay:
      return <MessageContent key={id} content={component.content} context={{ ...context, type: RenderType.NORMAL }} />;

    default:
      return null;
  }
}

/**
 * Renders a component that lives directly inside a Container (not top-level).
 * ActionRows inside a Container get horizontal padding so buttons align with text.
 */
function ContainerChild({
  component,
  id,
  context,
}: {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
}) {
  // ActionRow inside a Container: wrap with padding to match Section content
  if (component.type === ComponentType.ActionRow) {
    return (
      <div
        key={id}
        style={{
          padding: '0 16px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {component.components.map((nestedComponent, nestedId) => (
          <Component component={nestedComponent} id={nestedId} key={nestedId} />
        ))}
      </div>
    );
  }

  return <ComponentRow component={component} id={id} context={context} />;
}

export function Component({
  component,
  id,
}: {
  component: MessageActionRowComponent | ThumbnailComponent;
  id: number;
}) {
  switch (component.type) {
    case ComponentType.Button:
      return (
        <DiscordButton
          key={id}
          type={ButtonStyleMapping[component.style as keyof typeof ButtonStyleMapping]}
          url={component.url ?? undefined}
          emoji={component.emoji ? parseDiscordEmoji(component.emoji) : undefined}
          disabled={component.disabled}
        >
          {component.label}
        </DiscordButton>
      );

    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return <DiscordSelectMenu key={id} component={component} disabled={component.disabled} />;

    case ComponentType.Thumbnail:
      return <DiscordThumbnail key={id} url={component.media.url} />;

    default:
      return null;
  }
}
