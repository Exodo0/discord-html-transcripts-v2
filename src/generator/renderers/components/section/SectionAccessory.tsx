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
        width: 'auto',
        minWidth: '84px',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        marginLeft: '12px',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export default SectionAccessory;
