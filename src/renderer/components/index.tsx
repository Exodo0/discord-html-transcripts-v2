import { DiscordActionRow, DiscordAttachments } from '@derockdev/discord-components-react';
import {
  ComponentType,
  type MessageActionRowComponent,
  type TopLevelComponent,
  type ThumbnailComponent,
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

// ── Public component renderer (used in ActionRows) ────────────────────────

/**
 * Renders an individual action-row component (Button, SelectMenu, Thumbnail).
 */
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
      return (
        <DiscordThumbnail
          key={id}
          url={component.media.url}
          description={component.description ?? undefined}
        />
      );

    default:
      return null;
  }
}

// ── Top-level component dispatcher ────────────────────────────────────────

interface ComponentRowProps {
  component: TopLevelComponent;
  id: number;
  context: RenderMessageContext;
}

/**
 * Dispatches each top-level component to its dedicated renderer.
 * Handles: ActionRow, Container, File, MediaGallery, Section, Separator, TextDisplay.
 */
export default function ComponentRow({ component, id, context }: ComponentRowProps) {
  switch (component.type) {
    // ── Classic ActionRow (buttons / selects) ────────────────────────────
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

    // ── V2 Container ─────────────────────────────────────────────────────
    case ComponentType.Container: {
      const accentColor =
        'accentColor' in component ? (component.accentColor as number | undefined) : undefined;
      return (
        <DiscordContainer key={id} accentColor={accentColor}>
          <>
            {component.components.map((child, i) => (
              <ContainerChild key={i} component={child} id={i} context={context} />
            ))}
          </>
        </DiscordContainer>
      );
    }

    // ── V2 File ──────────────────────────────────────────────────────────
    case ComponentType.File:
      return <DiscordFileComponent key={id} component={component} />;

    // ── V2 MediaGallery ──────────────────────────────────────────────────
    case ComponentType.MediaGallery:
      return <DiscordMediaGallery key={id} component={component} />;

    // ── V2 Section ───────────────────────────────────────────────────────
    case ComponentType.Section: {
      const accessoryNode = component.accessory ? (
        <Component component={component.accessory} id={id} />
      ) : undefined;
      return (
        <DiscordSection key={id} accessoryNode={accessoryNode}>
          {component.components.map((child, i) => (
            <ContainerChild key={i} component={child} id={i} context={context} />
          ))}
        </DiscordSection>
      );
    }

    // ── V2 Separator ─────────────────────────────────────────────────────
    case ComponentType.Separator:
      return (
        <DiscordSeparator key={id} divider={component.divider ?? false} spacing={component.spacing} />
      );

    // ── V2 TextDisplay ───────────────────────────────────────────────────
    case ComponentType.TextDisplay:
      return (
        <TextDisplay key={id}>
          <MessageContent
            content={component.content}
            context={{ ...context, type: RenderType.NORMAL }}
          />
        </TextDisplay>
      );

    default:
      return null;
  }
}

// ── Container child renderer ──────────────────────────────────────────────

/**
 * Renders a component that lives directly inside a Container.
 * ActionRows get horizontal padding so buttons line up with Section text.
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

  return <ComponentRow component={component} id={id} context={context} />;
}

// ── Slot wrapper (used in message renderer for top-level component lists) ─

interface ComponentsSlotProps {
  components: readonly TopLevelComponent[];
  context: RenderMessageContext;
}

/**
 * Wraps all message-level top-level components in a DiscordAttachments slot.
 */
export function ComponentsSlot({ components, context }: ComponentsSlotProps) {
  return (
    <DiscordAttachments slot="components">
      {components.map((c, i) => (
        <ComponentRow key={i} id={i} component={c} context={context} />
      ))}
    </DiscordAttachments>
  );
}
