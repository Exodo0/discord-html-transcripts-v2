import React from 'react';
import { SeparatorSpacingSize } from 'discord.js';

interface DiscordSeparatorProps {
  divider: boolean;
  spacing: SeparatorSpacingSize;
}

const spacingMap: Record<SeparatorSpacingSize, string> = {
  [SeparatorSpacingSize.Large]: '8px',
  [SeparatorSpacingSize.Small]: '4px',
};

/**
 * Renders a Discord Separator — optionally a visible divider line with vertical margin.
 */
function DiscordSeparator({ divider, spacing }: DiscordSeparatorProps) {
  const marginY = spacingMap[spacing] ?? '2px';

  return (
    <div
      style={{
        width: '100%',
        height: divider ? '1px' : '0px',
        backgroundColor: divider ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        margin: `${marginY} 0`,
        flexShrink: 0,
      }}
    />
  );
}

export default DiscordSeparator;
