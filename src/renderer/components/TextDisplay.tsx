import React from 'react';

interface TextDisplayProps {
  children: React.ReactNode;
}

/**
 * Wrapper for TextDisplay content inside a Container/Section.
 * Applies Discord-matching font and colour.
 */
function TextDisplay({ children }: TextDisplayProps) {
  return (
    <div
      style={{
        padding: '8px 16px',
        color: '#dbdee1',
        fontSize: '15px',
        lineHeight: '1.375',
        fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </div>
  );
}

export default TextDisplay;
