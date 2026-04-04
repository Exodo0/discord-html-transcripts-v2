import type { CSSProperties } from 'react';
import { ButtonStyle } from 'discord.js';

// Container styles (used in utils for gallery layouts)
export const containerStyle = {
  display: 'grid',
  gap: '4px',
  width: '100%',
  maxWidth: '100%',
  borderRadius: '4px',
  overflow: 'hidden',
} satisfies CSSProperties;

// Base image style
export const baseImageStyle = {
  overflow: 'hidden',
  position: 'relative',
  background: '#2b2d31',
} satisfies CSSProperties;

// Button style mapping
export const ButtonStyleMapping = {
  [ButtonStyle.Primary]: 'primary',
  [ButtonStyle.Secondary]: 'secondary',
  [ButtonStyle.Success]: 'success',
  [ButtonStyle.Danger]: 'destructive',
  [ButtonStyle.Link]: 'secondary',
} as const;

export const globalStyles = `
  /* ── Components V2 ──────────────────────────────────────────────────── */

  .discord-button {
    color: #ffffff !important;
    padding: 2px 16px;
    border-radius: 4px;
    text-decoration: none !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    height: 32px;
    min-height: 32px;
    min-width: 60px;
    cursor: pointer;
    font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
    text-align: center;
    box-sizing: border-box;
    border: none;
    outline: none;
    user-select: none;
  }

  .discord-button-primary {
    background-color: #5865f2;
  }

  .discord-button-secondary {
    background-color: #4e5058;
    color: #ffffff !important;
  }

  .discord-button-success {
    background-color: #248046;
  }

  .discord-button-destructive {
    background-color: #da373c;
  }

  .discord-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .discord-select-menu {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 40px;
    background-color: #1e1f22;
    border-radius: 4px;
    color: #87898c;
    cursor: pointer;
    font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    justify-content: space-between;
    box-sizing: border-box;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .discord-select-menu-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
