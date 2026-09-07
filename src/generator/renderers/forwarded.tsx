import { DiscordAttachment, DiscordAttachments } from '@derockdev/discord-components-react';
import { MessageFlags, type APIMessage, type APIAttachment, type Message } from 'discord.js';
import React from 'react';
import type { RenderMessageContext } from '..';
import { formatBytes } from '../../utils/utils';
import ComponentRow from './components';
import MessageContent, { RenderType } from './content';
import { DiscordEmbed } from './embed';

type ForwardedProps = {
  message: Message;
  context: RenderMessageContext;
};

function getAttachmentType(attachment: { contentType?: string | null }): string {
  const type = attachment.contentType?.split('/')?.[0] ?? 'unknown';
  if (['audio', 'video', 'image'].includes(type)) return type;
  return 'file';
}

async function SnapshotAttachment({
  attachment,
  snapshot,
  context,
}: {
  attachment: Message['attachments'] extends Map<string, infer V> ? V : any;
  snapshot: Message;
  context: RenderMessageContext;
}) {
  let url = attachment.url;
  const name = attachment.name;
  const width = (attachment as any).width;
  const height = (attachment as any).height;
  const type = getAttachmentType(attachment as any) as 'image' | 'video' | 'audio' | 'file';

  if (type === 'image') {
    try {
      const downloaded = await context.callbacks.resolveImageSrc(
        (attachment as any).toJSON() as APIAttachment,
        snapshot.toJSON() as APIMessage,
      );
      if (downloaded !== null) {
        url = downloaded ?? url;
      }
    } catch {
      // ignore
    }
  }

  return (
    <DiscordAttachment
      type={type}
      size={formatBytes(attachment.size)}
      key={attachment.id}
      slot="attachment"
      url={url}
      alt={name ?? undefined}
      width={width ?? undefined}
      height={height ?? undefined}
    />
  );
}

export default async function ForwardedSnapshots({ message, context }: ForwardedProps) {
  // Check if message has snapshots
  // discord.js stores them in message.messageSnapshots (Collection)
  const snapshots = (message as any).messageSnapshots as Message['attachments'] | Map<string, Message> | undefined;

  // Also support direct array check for mocked objects
  let snapshotList: Message[] = [];

  if (snapshots) {
    // Collection case
    if (typeof (snapshots as any).values === 'function') {
      snapshotList = Array.from((snapshots as any).values()) as Message[];
    } else if (Array.isArray(snapshots)) {
      snapshotList = snapshots as Message[];
    } else if (typeof snapshots === 'object' && (snapshots as any).size === 0) {
      snapshotList = [];
    }
  }

  // Fallback: also check if flags has HasSnapshot but no collection (should still try)
  if (snapshotList.length === 0) return null;

  return (
    <>
      {await Promise.all(
        snapshotList.map(async (snapshot, idx) => {
          const isComponentsV2 = (snapshot.flags as any)?.has?.(MessageFlags.IsComponentsV2) ?? false;

          // Snapshot may be partial, ensure fields exist
          const content = (snapshot as any).content as string | null | undefined;
          const embeds = (snapshot as any).embeds as Message['embeds'] | undefined;
          const attachments = (snapshot as any).attachments as Message['attachments'] | undefined;
          const components = (snapshot as any).components as Message['components'] | undefined;

          // If snapshot is empty (should not happen), skip
          const hasContent = !!content;
          const hasEmbeds = !!(embeds && embeds.length > 0);
          const hasAttachments = !!(attachments && attachments.size > 0);
          const hasComponents = !!(components && components.length > 0);

          if (!hasContent && !hasEmbeds && !hasAttachments && !hasComponents) {
            return null;
          }

          return (
            <div
              key={(snapshot as any).id ?? `snapshot-${idx}`}
              style={{
                borderLeft: '2px solid #4f545c',
                backgroundColor: '#2b2d31',
                borderRadius: '4px',
                padding: '8px 12px',
                marginTop: '8px',
                marginBottom: '4px',
                maxWidth: '520px',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#b9bbbe',
                  marginBottom: hasContent || hasEmbeds || hasAttachments || hasComponents ? '6px' : '0px',
                  fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                {/* Forward icon - simple SVG */}
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17.707 12.293L13.707 16.293L12.293 14.879L14.172 13H8V11H14.172L12.293 9.12098L13.707 7.70698L17.707 11.707C18.098 12.097 18.098 12.703 17.707 13.093L17.707 12.293Z"
                  />
                </svg>
                <span>Forwarded</span>
              </div>

              {/* Snapshot content */}
              {!isComponentsV2 && hasContent && (
                <div style={{ marginBottom: hasEmbeds || hasAttachments || hasComponents ? '8px' : '0' }}>
                  <MessageContent content={content!} context={{ ...context, type: RenderType.NORMAL }} />
                </div>
              )}
              {/* Snapshot attachments - only for non-V2 */}
              {!isComponentsV2 && hasAttachments && (
                <div style={{ marginBottom: hasEmbeds || hasComponents ? '8px' : '0' }}>
                  <DiscordAttachments>
                    {await Promise.all(
                      Array.from((attachments as Map<string, any>).values()).map(async (att: any) => (
                        <SnapshotAttachment key={att.id} attachment={att} snapshot={snapshot} context={context} />
                      )),
                    )}
                  </DiscordAttachments>
                </div>
              )}

              {/* Snapshot embeds - only for non-V2 */}
              {!isComponentsV2 && hasEmbeds && (
                <div style={{ marginBottom: hasComponents ? '8px' : '0' }}>
                  {await Promise.all(
                    (embeds as Message['embeds']).map(async (embed, id) => (
                      <DiscordEmbed
                        embed={embed}
                        context={{ ...context, index: id, message: snapshot as Message }}
                        key={`${(snapshot as any).id ?? idx}-e-${id}`}
                      />
                    )),
                  )}
                </div>
              )}

              {/* Snapshot components - always */}
              {hasComponents && (
                <div>
                  {(components as Message['components']).map((component, id) => (
                    <ComponentRow
                      key={id}
                      id={id}
                      component={component as any}
                      context={context}
                      attachments={attachments as any}
                      message={snapshot as Message}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }),
      )}
    </>
  );
}


