import React from 'react';

interface DiscordThumbnailProps {
  url: string;
  description?: string;
}

/**
 * Renders a Discord Thumbnail accessory (80×80, cover-fit, rounded).
 */
function DiscordThumbnail({ url, description }: DiscordThumbnailProps) {
  return (
    <img
      src={url}
      alt={description ?? 'Thumbnail'}
      style={{
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '6px',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}

export default DiscordThumbnail;
