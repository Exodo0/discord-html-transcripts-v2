import React from 'react';

function DiscordContainer({ children, accentColor }: { children: React.ReactNode; accentColor?: number }) {
  const accent = typeof accentColor === 'number' ? `#${accentColor.toString(16).padStart(6, '0')}` : '#5865f2';

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        maxWidth: '520px',
        flexDirection: 'column',
        backgroundColor: '#3f4248',
        padding: '14px 14px 12px',
        border: '1px solid #4f5359',
        borderLeft: `4px solid ${accent}`,
        marginTop: '2px',
        marginBottom: '2px',
        borderRadius: '8px',
        gap: '8px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

export default DiscordContainer;
