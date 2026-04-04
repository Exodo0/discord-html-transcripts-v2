import React from 'react';

function DiscordContainer({ children, accentColor }: { children: React.ReactNode; accentColor?: number }) {
  const accent = typeof accentColor === 'number' ? `#${accentColor.toString(16).padStart(6, '0')}` : undefined;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        flexDirection: 'column',
        backgroundColor: 'rgba(30, 31, 34, 0.6)',
        padding: '0',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderLeft: accent ? `4px solid ${accent}` : '4px solid transparent',
        marginTop: '4px',
        marginBottom: '4px',
        borderRadius: '8px',
        gap: '0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export default DiscordContainer;
