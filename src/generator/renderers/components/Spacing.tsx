import React from 'react';
import { SeparatorSpacingSize } from 'discord.js';

function DiscordSeparator({ divider, spacing }: { divider: boolean; spacing: SeparatorSpacingSize }) {
  const marginY =
    spacing === SeparatorSpacingSize.Large ? '8px' : spacing === SeparatorSpacingSize.Small ? '4px' : '2px';

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
