import React from 'react';
import { SeparatorSpacingSize } from 'discord.js';

function DiscordSeparator({ divider, spacing }: { divider: boolean; spacing: SeparatorSpacingSize }) {
  const marginY =
    spacing === SeparatorSpacingSize.Large ? '10px' : spacing === SeparatorSpacingSize.Small ? '6px' : '2px';

  return (
    <div
      style={{
        width: '100%',
        height: divider ? '1px' : '0px',
        backgroundColor: divider ? '#4f5359' : 'transparent',
        margin: `${marginY} 0`,
      }}
    />
  );
}

export default DiscordSeparator;
