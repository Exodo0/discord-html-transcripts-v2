import { describe, it, expect, vi } from 'vitest';
import { buildProfiles } from '../../src/utils/buildProfiles';
import type { Message } from 'discord.js';

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    author: {
      id: 'user1',
      username: 'TestUser',
      displayName: 'TestUser',
      bot: false,
      displayAvatarURL: () => 'https://example.com/avatar.png',
      flags: { has: () => false },
    },
    member: null,
    interaction: null,
    thread: null,
    ...overrides,
  } as unknown as Message;
}

describe('buildProfiles', () => {
  it('builds a profile for a single message author', async () => {
    const profiles = await buildProfiles([makeMessage()]);
    expect(profiles).toHaveProperty('user1');
    expect(profiles['user1']?.author).toBe('TestUser');
    expect(profiles['user1']?.avatar).toBe('https://example.com/avatar.png');
  });

  it('de-duplicates profiles for the same author', async () => {
    const profiles = await buildProfiles([makeMessage(), makeMessage()]);
    expect(Object.keys(profiles)).toHaveLength(1);
  });

  it('includes interaction user if present', async () => {
    const msg = makeMessage({
      interaction: {
        user: {
          id: 'interactionUser',
          username: 'InteractionUser',
          displayName: 'InteractionUser',
          bot: false,
          displayAvatarURL: () => 'https://example.com/int.png',
          flags: { has: () => false },
        },
      } as unknown as Message['interaction'],
    });
    const profiles = await buildProfiles([msg]);
    expect(profiles).toHaveProperty('interactionUser');
  });

  it('returns empty object for empty message list', async () => {
    const profiles = await buildProfiles([]);
    expect(profiles).toEqual({});
  });
});
