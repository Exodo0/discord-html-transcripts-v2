import React from 'react';
import type { MediaGalleryComponent } from 'discord.js';
import { containerStyle, baseImageStyle } from '../../styles/global';

/** Max items to display in the gallery grid (Discord caps at 10). */
const MAX_DISPLAY = 10;

function getGalleryLayout(count: number): React.CSSProperties {
  if (count === 1) return { ...containerStyle, gridTemplateColumns: '1fr', maxWidth: '280px' };
  if (count === 2) return { ...containerStyle, gridTemplateColumns: '1fr 1fr', maxWidth: '320px' };
  if (count <= 4) return { ...containerStyle, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
  if (count === 5) return { ...containerStyle, gridTemplateColumns: '1fr 1fr 1fr' };
  return { ...containerStyle, gridTemplateColumns: '1fr 1fr 1fr' };
}

function getItemStyle(idx: number, count: number): React.CSSProperties {
  if (count === 1) return { ...baseImageStyle, aspectRatio: '1 / 1', borderRadius: '8px' };

  if (count === 3 && idx === 0)
    return { ...baseImageStyle, gridRow: '1 / span 2', gridColumn: '1', aspectRatio: '1/2' };

  if (count === 5) {
    if (idx < 2) return { ...baseImageStyle, gridRow: '1', gridColumn: idx === 0 ? '1 / span 2' : '3' };
    return { ...baseImageStyle, gridRow: '2', gridColumn: `${idx - 2 + 1}` };
  }

  return baseImageStyle;
}

interface DiscordMediaGalleryProps {
  component: MediaGalleryComponent;
}

/**
 * Renders a Discord V2 MediaGallery component.
 * Displays up to MAX_DISPLAY items in an auto-layout grid.
 */
function DiscordMediaGallery({ component }: DiscordMediaGalleryProps) {
  if (!component.items?.length) return null;

  const items = component.items.slice(0, MAX_DISPLAY);
  const overflow = component.items.length - MAX_DISPLAY;

  return (
    <div style={{ padding: '0 16px 12px', boxSizing: 'border-box' }}>
      <div style={getGalleryLayout(items.length)}>
        {items.map((media, idx) => (
          <div key={idx} style={{ ...getItemStyle(idx, items.length), borderRadius: '4px', overflow: 'hidden' }}>
            <img
              src={media.media.url}
              alt={media.description ?? 'Media'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {overflow > 0 && idx === items.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                +{overflow}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiscordMediaGallery;
