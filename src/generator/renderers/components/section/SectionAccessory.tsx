import React from 'react';

interface SectionAccessoryProps {
  children?: React.ReactNode;
}

function SectionAccessory({ children }: SectionAccessoryProps) {
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
