import { ButtonStyle } from 'discord.js';

export const ButtonStyleMapping = {
  [ButtonStyle.Primary]: 'primary',
  [ButtonStyle.Secondary]: 'secondary',
  [ButtonStyle.Success]: 'success',
  [ButtonStyle.Danger]: 'destructive',
  [ButtonStyle.Link]: 'secondary',
  [ButtonStyle.Premium]: 'premium',
} as const;

export type ButtonStyleType = (typeof ButtonStyleMapping)[keyof typeof ButtonStyleMapping];
