import React from 'react';

interface SectionContentProps {
  children: React.ReactNode;
}

function SectionContent({ children }: SectionContentProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        gap: '6px',
      }}
    >
      {children}
    </div>
  );
}

export default SectionContent;
