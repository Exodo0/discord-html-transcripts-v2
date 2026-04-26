import { DiscordActionRow, DiscordAttachments } from '@derockdev/discord-components-react';
import {
  ComponentType,
  type MessageActionRowComponent,
  type ThumbnailComponent,
  type TopLevelComponent,
} from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from '../index';
import { ButtonStyleMapping } from '../../styles/buttonStyles';
import { parseDiscordEmoji } from '../../utils/utils';
import DiscordButton from './Button';
import DiscordContainer from './Container';
import DiscordFileComponent from './FileComponent';
import DiscordMediaGallery from './MediaGallery';
import DiscordSeparator from './Separator';
import DiscordSelectMenu from './SelectMenu';
import DiscordThumbnail from './Thumbnail';
import TextDisplay from './TextDisplay';
import DiscordSection from './section/Section';
import MessageContent, { RenderType } from '../content/MessageContent';

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
          type={ButtonStyleMapping[component.style as keyof typeof ButtonStyleMapping] ?? 'secondary'}
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
      return <DiscordThumbnail key={id} url={component.media.url} description={component.description ?? undefined} />;

    default:
      return null;
  }
}

interface ComponentRowProps {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
}

export default async function ComponentRow({ component, id, context }: ComponentRowProps) {
  switch (component.type) {
    case ComponentType.ActionRow:
      return (
        <DiscordActionRow key={id}>
          <>
            {component.components.map((c, i) => (
              <Component component={c} id={i} key={i} />
            ))}
          </>
        </DiscordActionRow>
      );

    case ComponentType.Container: {
      const accentColor = 'accentColor' in component ? (component.accentColor as number | undefined) : undefined;
      const children = await Promise.all(
        component.components.map((child, i) => ContainerChild({ component: child, id: i, context }))
      );

      return (
        <DiscordContainer key={id} accentColor={accentColor}>
          <>{children}</>
        </DiscordContainer>
      );
    }

    case ComponentType.File:
      return <DiscordFileComponent key={id} component={component} />;

    case ComponentType.MediaGallery:
      return <DiscordMediaGallery key={id} component={component} />;

    case ComponentType.Section: {
      const accessoryNode = component.accessory ? <Component component={component.accessory} id={id} /> : undefined;
      const children = await Promise.all(
        component.components.map((child, i) => ContainerChild({ component: child, id: i, context }))
      );

      return (
        <DiscordSection key={id} accessoryNode={accessoryNode}>
          {children}
        </DiscordSection>
      );
    }

    case ComponentType.Separator:
      return <DiscordSeparator key={id} divider={component.divider ?? false} spacing={component.spacing} />;

    case ComponentType.TextDisplay:
      return (
        <TextDisplay key={id}>
          {await MessageContent({ content: component.content, context: { ...context, type: RenderType.NORMAL } })}
        </TextDisplay>
      );

    default:
      return null;
  }
}

async function ContainerChild({
  component,
  id,
  context,
}: {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
}) {
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
        {component.components.map((c, i) => (
          <Component component={c} id={i} key={i} />
        ))}
      </div>
    );
  }

  return await ComponentRow({ component, id, context });
}

interface ComponentsSlotProps {
  components: readonly TopLevelComponent[];
  context: RenderMessageContext;
}

export async function ComponentsSlot({ components, context }: ComponentsSlotProps) {
  const renderedComponents = await Promise.all(
    components.map((component, i) => ComponentRow({ component, id: i, context }))
  );

  return <DiscordAttachments slot="components">{renderedComponents}</DiscordAttachments>;
}
