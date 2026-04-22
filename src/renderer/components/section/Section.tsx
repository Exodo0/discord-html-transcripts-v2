import React from 'react';
import SectionContent from './SectionContent';
import SectionAccessory from './SectionAccessory';

interface DiscordSectionProps {
  children: React.ReactNode;
  accessoryNode?: React.ReactNode;
}

/**
 * Renders a Discord V2 Section (text on the left, optional accessory on the right).
 * The caller is responsible for resolving the accessory into a ReactNode.
 */
function DiscordSection({ children, accessoryNode }: DiscordSectionProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        padding: '12px 16px',
        boxSizing: 'border-box',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <SectionContent>{children}</SectionContent>
      {accessoryNode && <SectionAccessory>{accessoryNode}</SectionAccessory>}
    </div>
  );
}

export default DiscordSection;
