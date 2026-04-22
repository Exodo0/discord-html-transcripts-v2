import type { CSSProperties } from 'react';

/** Base grid layout for media gallery containers */
export const containerStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
  width: '100%',
  maxWidth: '100%',
  borderRadius: '4px',
  overflow: 'hidden',
};

/** Base image cell style within a gallery */
export const baseImageStyle: CSSProperties = {
  overflow: 'hidden',
  position: 'relative',
  background: '#2b2d31',
};

/** Global CSS injected once into every transcript HTML */
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
  .discord-button-primary   { background-color: #5865f2; }
  .discord-button-secondary { background-color: #4e5058; color: #ffffff !important; }
  .discord-button-success   { background-color: #248046; }
  .discord-button-destructive { background-color: #da373c; }
  .discord-button-premium   { background: linear-gradient(135deg, #ff73fa, #ffe27a); color: #000 !important; }
  .discord-button-disabled  { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

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
  .discord-select-menu-disabled { opacity: 0.5; cursor: not-allowed; }
`;
