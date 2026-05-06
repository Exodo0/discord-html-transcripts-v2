import type { CSSProperties } from 'react';
import { ButtonStyle } from 'discord.js';

// Container styles
export const containerStyle = {
  display: 'grid',
  gap: '4px',
  width: '100%',
  maxWidth: '524px',
  borderRadius: '8px',
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
  /* Discord V2 Container */
  .discord-v2-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 524px;
    background-color: #2b2d31;
    border-radius: 8px;
    overflow: hidden;
    box-sizing: border-box;
  }

  /* Text Display */
  .discord-text-display {
    font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.375rem;
    color: #dbdee1;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }

  /* Separator */
  .discord-separator {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  /* Section */
  .discord-section {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    gap: 16px;
  }

  /* Media Gallery */
  .discord-media-gallery {
    border-radius: 8px;
    overflow: hidden;
  }

  /* Buttons */
  .discord-button {
    color: #ffffff !important;
    padding: 2px 16px;
    border-radius: 8px;
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
    transition: background-color 0.2s ease, opacity 0.2s ease;
    white-space: nowrap;
    line-height: 1;
    gap: 8px;
  }

  .discord-button:hover {
    opacity: 0.85;
  }

  .discord-button-primary {
    background-color: #5865f2;
  }

  .discord-button-secondary {
    background-color: #4e5058;
  }

  .discord-button-success {
    background-color: #248046;
  }

  .discord-button-destructive {
    background-color: #da373c;
  }

  /* Select Menu */
  .discord-select-menu {
    margin-top: 4px;
    margin-bottom: 4px;
    position: relative;
    width: 100%;
    max-width: 524px;
    height: 40px;
    background-color: #1e1f22;
    border-radius: 4px;
    color: #949ba4;
    cursor: default;
    font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    justify-content: space-between;
    box-sizing: border-box;
    border: 1px solid #1e1f22;
  }

  .discord-select-menu:hover {
    background-color: #232428;
  }

  /* Discord Embed */
  .discord-embed {
    border-color: #5865f2;
  }

  /* Discord Header */
  discord-header {
    --header-bg: #2b2d31;
  }

  /* Discord Messages */
  discord-messages {
    --font-family: Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif;
    --main-text-color: #dbdee1;
    --background-color: #313338;
  }

  /* Mention styling */
  discord-mention {
    --mention-color: #c9cdfb;
    --mention-hover: #dee0fc;
  }

  /* Reply styling */
  discord-reply {
    --reply-color: #949ba4;
  }

  /* Spoiler styling */
  discord-spoiler {
    --spoiler-bg: #1e1f22;
    --spoiler-hover: #2b2d31;
  }

  /* Reaction styling */
  discord-reaction {
    --reaction-bg: #2b2d31;
    --reaction-hover: #383a40;
  }
`;
