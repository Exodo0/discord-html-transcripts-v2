import React from 'react';
import { DiscordSpoiler } from '@derockdev/discord-components-react';

interface DiscordThumbnailProps {
  url: string;
  description?: string;
  spoiler?: boolean;
}

function DiscordThumbnail({ url, description, spoiler }: DiscordThumbnailProps) {
  const thumbnail = (
    <img
      src={url}
      alt={description || 'Thumbnail'}
      style={{
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        flexShrink: 0,
      }}
    />
  );

  if (spoiler) {
    return <DiscordSpoiler>{thumbnail}</DiscordSpoiler>;
  }

  return thumbnail;
}

export default DiscordThumbnail;
