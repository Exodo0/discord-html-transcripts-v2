import React from 'react';

interface DiscordButtonProps {
  /** One of the ButtonStyleMapping values (e.g. 'primary', 'secondary', 'destructive', 'premium') */
  type: string;
  url?: string;
  emoji?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Renders a Discord Button as a static HTML element.
 * Link buttons open in a new tab; all others render as non-interactive spans.
 */
function DiscordButton({ type, url, emoji, children, disabled = false }: DiscordButtonProps) {
  const className = `discord-button discord-button-${type}${disabled ? ' discord-button-disabled' : ''}`;
  const isUrl = emoji && (emoji.startsWith('http') || emoji.startsWith('//'));

  const emojiNode = emoji ? (
    isUrl ? (
      <img
        src={emoji}
        alt="emoji"
        style={{
          width: '16px',
          height: '16px',
          marginRight: children ? '6px' : '0',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    ) : (
      <span style={{ marginRight: children ? '6px' : '0', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>
        {emoji}
      </span>
    )
  ) : null;

  const externalIcon =
    url && !disabled ? (
      <span style={{ marginLeft: '6px', display: 'flex', alignItems: 'center' }}>
        <svg role="img" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
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
    ) : null;

  const content = (
    <>
      {emojiNode}
      {children && <span style={{ display: 'flex', alignItems: 'center' }}>{children}</span>}
      {externalIcon}
    </>
  );

  if (url && !disabled) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <span aria-disabled={disabled} className={className}>
      {content}
    </span>
  );
}

export default DiscordButton;
