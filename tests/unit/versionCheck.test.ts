import { describe, it, expect, vi, afterEach } from 'vitest';

// We need to mock discord.js BEFORE importing the module under test
vi.mock('discord.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('discord.js')>();
  return { ...actual, version: '14.0.0' };
});

describe('checkDiscordJsVersion', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does not warn for supported discord.js v14', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { checkDiscordJsVersion } = await import('../../src/core/versionCheck');
    checkDiscordJsVersion();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
