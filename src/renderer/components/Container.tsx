import React from 'react';
import { numberToHexColor } from '../../utils/utils';

interface DiscordContainerProps {
  children: React.ReactNode;
  accentColor?: number;
}

/**
 * Renders a Discord V2 Container component.
 * Applies an accent border on the left when accentColor is provided.
 */
function DiscordContainer({ children, accentColor }: DiscordContainerProps) {
  const accent = typeof accentColor === 'number' ? numberToHexColor(accentColor) : undefined;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        flexDirection: 'column',
        backgroundColor: 'rgba(30, 31, 34, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: accent ? `4px solid ${accent}` : '4px solid transparent',
        marginTop: '4px',
        marginBottom: '4px',
        borderRadius: '8px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export default DiscordContainer;
