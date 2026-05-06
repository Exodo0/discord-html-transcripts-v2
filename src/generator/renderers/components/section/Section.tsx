import React from 'react';
import type { Attachment as AttachmentType, ButtonComponent, ThumbnailComponent } from 'discord.js';
import { Component } from '../../components';
import SectionContent from './SectionContent';
import SectionAccessory from './SectionAccessory';

interface DiscordSectionProps {
  children: React.ReactNode;
  accessory?: ButtonComponent | ThumbnailComponent;
  id: number;
  attachments?: Map<string, AttachmentType>;
}

function DiscordSection({ children, accessory, id, attachments }: DiscordSectionProps) {
  return (
    <div
      className="discord-section"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <SectionContent>{children}</SectionContent>
      <SectionAccessory>
        {accessory && <Component component={accessory} id={id} attachments={attachments} />}
      </SectionAccessory>
    </div>
  );
}

export default DiscordSection;
