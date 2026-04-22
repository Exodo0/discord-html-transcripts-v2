import React from 'react';

/**
 * Flex wrapper for the Section accessory (Thumbnail or Button).
 */
function SectionAccessory({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </div>
  );
}

export default SectionAccessory;
