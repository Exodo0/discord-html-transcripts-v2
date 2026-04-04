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
        flex: '1 1 auto',
        minWidth: 0,
        gap: '4px',
        color: '#dbdee1',
        fontSize: '15px',
        lineHeight: '1.375',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

export default SectionContent;
