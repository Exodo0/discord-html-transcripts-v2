import React from 'react';

interface DiscordButtonProps {
  type: string;
  url?: string;
  emoji?: string;
  children: React.ReactNode;
}

export function DiscordButton({ type, url, emoji, children }: DiscordButtonProps) {
  const isLink = !!url;

  return (
    <a
      href={url}
      target="_blank"
      className={`discord-button discord-button-${type}`}
      style={{
        color: '#ffffff',
        padding: '2px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '500',
        height: '32px',
        minHeight: '32px',
        minWidth: '60px',
        cursor: isLink ? 'pointer' : 'default',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
        textAlign: 'center',
        boxSizing: 'border-box',
        border: 'none',
        outline: 'none',
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        whiteSpace: 'nowrap',
        lineHeight: '1',
        gap: '8px',
      }}
    >
      {emoji && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={emoji} alt="emoji" style={{ width: '16px', height: '16px' }} />
        </span>
      )}
      <span style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children}
      </span>
      {isLink && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-4.3 4.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1Z"
            />
            <path
              fill="currentColor"
              d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z"
            />
          </svg>
        </span>
      )}
    </a>
  );
}

export default DiscordButton;
