import { DiscordAttachment, DiscordAttachments } from '@derockdev/discord-components-react';
import React from 'react';
import type { APIAttachment, APIMessage, Attachment as AttachmentType, Message } from 'discord.js';
import type { RenderMessageContext } from '../index';
import type { AttachmentTypes } from '../../types';
import { formatBytes } from '../../utils/utils';

function getAttachmentType(attachment: AttachmentType): AttachmentTypes {
  const prefix = attachment.contentType?.split('/')?.[0];
  if (prefix === 'audio' || prefix === 'video' || prefix === 'image') return prefix;
  return 'file';
}

/**
 * Renders all message-level attachments in a DiscordAttachments slot.
 */
export async function Attachments({
  message,
  context,
}: {
  message: Message;
  context: RenderMessageContext;
}) {
  if (message.attachments.size === 0) return null;

  return (
    <DiscordAttachments slot="attachments">
      {message.attachments.map((attachment, id) => (
        <Attachment key={id} attachment={attachment} message={message} context={context} />
      ))}
    </DiscordAttachments>
  );
}

/**
 * Renders a single message attachment.
 * Images are optionally downloaded and inlined as base64 data URLs.
 */
export async function Attachment({
  attachment,
  context,
  message,
}: {
  attachment: AttachmentType;
  context: RenderMessageContext;
  message: Message;
}) {
  const type = getAttachmentType(attachment);
  let url = attachment.url;

  if (type === 'image') {
    const resolved = await context.callbacks.resolveImageSrc(
      attachment.toJSON() as APIAttachment,
      message.toJSON() as APIMessage
    );
    if (resolved !== null) url = resolved ?? url;
  }

  return (
    <DiscordAttachment
      type={type}
      size={formatBytes(attachment.size)}
      slot="attachment"
      url={url}
      alt={attachment.name ?? undefined}
      width={attachment.width ?? undefined}
      height={attachment.height ?? undefined}
    />
  );
}
