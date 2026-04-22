import React from 'react';
import { DiscordAttachment, DiscordSpoiler } from '@derockdev/discord-components-react';
import type { FileComponent } from 'discord.js';

interface FileComponentProps {
  component: FileComponent;
}

/**
 * Renders a Discord V2 File component (with optional spoiler wrapper).
 */
function DiscordFileComponent({ component }: FileComponentProps) {
  const attachment = (
    <DiscordAttachment
      type="file"
      slot="attachment"
      url={component.file.url}
      alt="File attachment"
    />
  );

  if (component.spoiler) {
    return <DiscordSpoiler slot="attachment">{attachment}</DiscordSpoiler>;
  }

  return attachment;
}

export default DiscordFileComponent;
