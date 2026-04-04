import React from 'react';

function DiscordThumbnail({ url }: { url: string }) {
  return (
    <img
      src={url}
      alt="Thumbnail"
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
