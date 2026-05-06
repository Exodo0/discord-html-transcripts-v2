import React from 'react';
import type { APIAttachment, APIMessage, Attachment as AttachmentType, MediaGalleryComponent } from 'discord.js';
import { DiscordSpoiler } from '@derockdev/discord-components-react';
import { getGalleryLayout, getImageStyle } from './utils';
import type { ResolveImageCallback } from '../../../downloader/images';

/**
 * Resolves a URL that might be an `attachment://` reference to an actual CDN URL.
 */
function resolveUrl(url: string, attachments: Map<string, AttachmentType>): string {
  if (!url) return '';
  if (url.startsWith('attachment://')) {
    const filename = url.slice('attachment://'.length);
    for (const [, attachment] of attachments) {
      if (attachment.name === filename || attachment.url.includes(encodeURIComponent(filename))) {
        return attachment.url;
      }
    }
  }
  return url;
}

/**
 * Safely gets the media URL from a MediaGalleryItem.
 */
function getMediaUrl(item: { media?: { url?: string }; data?: { media?: { url?: string } } }): string {
  if (item.media?.url) return item.media.url;
  if (item.data?.media?.url) return item.data.media.url;
  return '';
}

interface MediaGalleryItemResolved {
  url: string;
  description: string | null;
  spoiler: boolean;
  width: number;
  height: number;
}

interface DiscordMediaGalleryProps {
  component: MediaGalleryComponent;
  attachments: Map<string, AttachmentType>;
  resolveImageSrc?: ResolveImageCallback;
  message?: APIMessage;
}

async function DiscordMediaGallery({ component, attachments, resolveImageSrc, message }: DiscordMediaGalleryProps) {
  if (!component.items || component.items.length === 0) {
    return null;
  }

  const count = component.items.length;
  const imagesToShow = component.items.slice(0, 10);
  const hasMore = count > 10;

  // Resolve all image URLs (download to base64 if resolveImageSrc is available)
  const resolvedItems: MediaGalleryItemResolved[] = await Promise.all(
    imagesToShow.map(async (media) => {
      const rawUrl = getMediaUrl(media);
      const resolvedUrl = resolveUrl(rawUrl, attachments);
      const rawMedia = media.media?.data;
      const width = rawMedia?.width ?? 0;
      const height = rawMedia?.height ?? 0;

      // If we have resolveImageSrc and a valid URL, try to download
      if (resolveImageSrc && message && resolvedUrl) {
        const fakeAttachment = {
          id: '0',
          filename: media.description || 'media.png',
          url: resolvedUrl,
          proxy_url: resolvedUrl,
          size: 0,
          width: width || 1,
          height: height || 1,
        } as APIAttachment;

        try {
          const downloaded = await resolveImageSrc(fakeAttachment, message);
          if (downloaded) {
            return {
              url: downloaded,
              description: media.description,
              spoiler: media.spoiler,
              width,
              height,
            };
          }
        } catch {
          // Fall through to use original URL
        }
      }

      return {
        url: resolvedUrl,
        description: media.description,
        spoiler: media.spoiler,
        width,
        height,
      };
    })
  );

  return (
    <div
      className="discord-media-gallery"
      style={{
        ...getGalleryLayout(count),
        borderRadius: '8px',
        overflow: 'hidden',
        marginTop: '4px',
        marginBottom: '4px',
      }}
    >
      {resolvedItems.map((item, idx) => {
        if (!item.url) return null;

        const imageElement = (
          <img
            src={item.url}
            alt={item.description || 'Media content'}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        );

        return (
          <div key={idx} style={{ ...getImageStyle(idx, count), position: 'relative' }}>
            {item.spoiler ? <DiscordSpoiler>{imageElement}</DiscordSpoiler> : imageElement}
            {hasMore && idx === resolvedItems.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                +{count - 10}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DiscordMediaGallery;
