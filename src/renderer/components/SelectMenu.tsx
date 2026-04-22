import React from 'react';
import { ComponentType, type MessageActionRowComponent } from 'discord.js';
import { parseDiscordEmoji } from '../../utils/utils';

type SelectComponent = Exclude<MessageActionRowComponent, { type: ComponentType.Button }>;

const SELECT_LABEL_MAP: Partial<Record<ComponentType, string>> = {
  [ComponentType.UserSelect]: 'Select a user…',
  [ComponentType.RoleSelect]: 'Select a role…',
  [ComponentType.MentionableSelect]: 'Select a mentionable…',
  [ComponentType.ChannelSelect]: 'Select a channel…',
  [ComponentType.StringSelect]: 'Make a selection…',
};

function getSelectLabel(type: ComponentType): string {
  return SELECT_LABEL_MAP[type] ?? 'Select an option…';
}

interface DiscordSelectMenuProps {
  component: SelectComponent;
  disabled?: boolean;
}

/**
 * Renders a Discord Select Menu as a static (non-interactive) visual element.
 * Shows the placeholder text and a dropdown chevron icon.
 */
function DiscordSelectMenu({ component, disabled = false }: DiscordSelectMenuProps) {
  const isStringSelect = component.type === ComponentType.StringSelect;
  const placeholder = component.placeholder ?? getSelectLabel(component.type);

  return (
    <div className={`discord-select-menu${disabled ? ' discord-select-menu-disabled' : ''}`}>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {placeholder}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M7 10L12 15L17 10H7Z" />
        </svg>
      </div>
      {/* Show string-select options as collapsed tooltip-style */}
      {isStringSelect && (component as { options?: Array<{ label: string; emoji?: import('discord.js').APIMessageComponentEmoji }> }).options?.length ? (
        <div
          style={{
            display: 'none', // static transcript — options are hidden (no JS interaction)
            position: 'absolute',
            top: '44px',
            left: 0,
            width: '100%',
            backgroundColor: '#2b2d31',
            borderRadius: '4px',
            zIndex: 10,
            border: '1px solid #1e1f22',
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {(component as { options: Array<{ label: string; emoji?: import('discord.js').APIMessageComponentEmoji }> }).options.map((option, idx, arr) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: idx < arr.length - 1 ? '1px solid #1e1f22' : 'none',
              }}
            >
              {option.emoji && (
                <span style={{ marginRight: '8px' }}>
                  <img
                    src={parseDiscordEmoji(option.emoji)}
                    alt={option.emoji.name ?? 'emoji'}
                    style={{ width: '16px', height: '16px', verticalAlign: 'middle' }}
                  />
                </span>
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default DiscordSelectMenu;
