import React from 'react';
import { SeparatorSpacingSize } from 'discord.js';

function DiscordSeparator({ divider, spacing }: { divider: boolean; spacing: SeparatorSpacingSize }) {
  const isLarge = spacing === SeparatorSpacingSize.Large;

  return (
    <div
      className="discord-separator"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: isLarge ? '8px 0' : '4px 0',
        boxSizing: 'border-box',
      }}
    >
      {divider && (
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#3f4248',
          }}
        />
      )}
    </div>
  );
}

export default DiscordSeparator;
