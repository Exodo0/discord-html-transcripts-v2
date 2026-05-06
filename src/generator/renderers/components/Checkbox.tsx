import React from 'react';

interface DiscordCheckboxProps {
  label: string;
  checked: boolean;
}

function DiscordCheckbox({ label, checked }: DiscordCheckboxProps) {
  return (
    <div
      className="discord-checkbox"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 0',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '14px',
        color: '#dbdee1',
        cursor: 'default',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          border: checked ? 'none' : '2px solid #72767d',
          backgroundColor: checked ? '#5865f2' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
        }}
      >
        {checked && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9.55 18.2L3.65 12.3L5.05 10.9L9.55 15.4L18.95 6.05L20.35 7.45L9.55 18.2Z" fill="white" />
          </svg>
        )}
      </div>
      <span style={{ lineHeight: '1.25' }}>{label}</span>
    </div>
  );
}

export default DiscordCheckbox;
