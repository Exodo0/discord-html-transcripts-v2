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
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export default SectionAccessory;
