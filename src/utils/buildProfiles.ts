import type { GuildMember, Message, User } from 'discord.js';
import { UserFlags as UserFlagsEnum } from 'discord.js';

export type Profile = {
  /** Display name of the author */
  author: string;
  /** Avatar URL (64px) */
  avatar?: string;
  /** Highest hoisted role colour */
  roleColor?: string;
  /** Highest hoisted role icon */
  roleIcon?: string;
  /** Highest hoisted role name */
  roleName?: string;
  /** Is this user a bot? */
  bot?: boolean;
  /** Is this user a verified bot? */
  verified?: boolean;
};

/**
 * Builds a map of user-id → Profile for all authors found in a set of messages.
 * Includes interaction users and thread last-message authors.
 */
export async function buildProfiles(messages: Message[]): Promise<Record<string, Profile>> {
  const profiles: Record<string, Profile> = {};

  for (const message of messages) {
    const { author, member, interaction, thread } = message;

    if (!profiles[author.id]) {
      profiles[author.id] = buildProfile(member, author);
    }

    if (interaction && !profiles[interaction.user.id]) {
      profiles[interaction.user.id] = buildProfile(null, interaction.user);
    }

    if (thread?.lastMessage) {
      const { author: tAuthor, member: tMember } = thread.lastMessage;
      if (!profiles[tAuthor.id]) {
        profiles[tAuthor.id] = buildProfile(tMember, tAuthor);
      }
    }
  }

  return profiles;
}

function buildProfile(member: GuildMember | null, author: User): Profile {
  return {
    author: member?.nickname ?? author.displayName ?? author.username,
    avatar: member?.displayAvatarURL({ size: 64 }) ?? author.displayAvatarURL({ size: 64 }),
    roleColor: member?.displayHexColor ?? undefined,
    roleIcon: member?.roles.icon?.iconURL() ?? undefined,
    roleName: member?.roles.hoist?.name ?? undefined,
    bot: author.bot || undefined,
    verified: author.flags?.has(UserFlagsEnum.VerifiedBot) || undefined,
  };
}
