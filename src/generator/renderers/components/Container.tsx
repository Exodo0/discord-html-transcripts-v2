import React from 'react';
import { DiscordSpoiler } from '@derockdev/discord-components-react';

interface DiscordContainerProps {
  children: React.ReactNode;
  accentColor?: number;
  spoiler?: boolean;
}

function DiscordContainer({ children, accentColor, spoiler }: DiscordContainerProps) {
  const container = (
    <div
      className="discord-v2-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '524px',
        backgroundColor: '#2b2d31',
        borderRadius: '8px',
        borderLeft: accentColor ? `4px solid #${accentColor.toString(16).padStart(6, '0')}` : 'none',
        padding: accentColor ? '12px 16px' : '16px',
        gap: '0',
        boxSizing: 'border-box',
        marginTop: '4px',
        marginBottom: '4px',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );

  if (spoiler) {
    return <DiscordSpoiler>{container}</DiscordSpoiler>;
  }

  return container;
}

export default DiscordContainer;
