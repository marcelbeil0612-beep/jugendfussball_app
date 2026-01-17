import "server-only";

import type { Role } from "@prisma/client";
import crypto from "node:crypto";

import { prisma } from "@/lib/db";

export type SimpleTeamMember = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  isCurrentUser: boolean;
};

export type TeamMembersForUser = {
  members: SimpleTeamMember[];
  currentUserRole: Role | null;
};

export type TeamMemberRole = Role;

export type UserTeam = {
  id: string;
  name: string;
  role: TeamMemberRole;
  isActive: boolean;
};

export type AdminTeam = {
  id: string;
  name: string;
  _count: {
    members: number;
  };
};

const MIN_TEAM_NAME_LENGTH = 3;
const MAX_TEAM_NAME_LENGTH = 60;

function normalizeTeamName(name: string) {
  return name.trim();
}

function assertValidTeamName(name: string) {
  const normalized = normalizeTeamName(name);
  if (
    normalized.length < MIN_TEAM_NAME_LENGTH ||
    normalized.length > MAX_TEAM_NAME_LENGTH
  ) {
    throw new Error(
      `Team-Name muss zwischen ${MIN_TEAM_NAME_LENGTH} und ${MAX_TEAM_NAME_LENGTH} Zeichen lang sein.`
    );
  }
  return normalized;
}

/**
 * Liefert die Mitglieder des aktiven Teams für einen User.
 * TRAINER sehen alle Mitglieder; alle anderen Rollen sehen nur sich selbst.
 */
export async function getMembersForActiveTeam(
  userId: string,
): Promise<TeamMembersForUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, activeTeamId: true },
  });

  if (!user?.activeTeamId) {
    return { members: [], currentUserRole: null };
  }

  const activeTeam = await prisma.team.findFirst({
    where: { id: user.activeTeamId, deletedAt: null },
    select: { id: true },
  });

  if (!activeTeam) {
    return { members: [], currentUserRole: null };
  }

  const memberships = await prisma.teamMember.findMany({
    where: { teamId: user.activeTeamId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  const currentMembership = memberships.find((member) => member.userId === user.id);

  if (!currentMembership) {
    return { members: [], currentUserRole: null };
  }

  const currentUserRole = currentMembership.role;
  const visibleMemberships =
    currentUserRole === "TRAINER"
      ? memberships
      : memberships.filter((member) => member.userId === user.id);

  const members: SimpleTeamMember[] = visibleMemberships.map((member) => ({
    memberId: member.id,
    userId: member.user.id,
    name: member.user.email ?? "Unbekannt",
    email: member.user.email ?? "",
    role: member.role,
    isCurrentUser: member.user.id === user.id,
  }));

  return { members, currentUserRole };
}

export async function getTeamsForUser(userId: string): Promise<UserTeam[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, activeTeamId: true },
  });

  if (!user) {
    return [];
  }

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id, team: { deletedAt: null } },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.team.id,
    name: membership.team.name,
    role: membership.role,
    isActive: membership.team.id === user.activeTeamId,
  }));
}

export async function setActiveTeam(
  userId: string,
  teamId: string,
): Promise<void> {
  const membership = await prisma.teamMember.findFirst({
    where: {
      userId,
      teamId,
      team: { deletedAt: null },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new Error("User is not a member of this team");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      activeTeamId: teamId,
    },
  });
}

export async function getAllTeamsForAdmin(): Promise<AdminTeam[]> {
  return prisma.team.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTeam(teamName: string, creatorUserId: string) {
  const normalizedName = assertValidTeamName(teamName);

  const existingTeam = await prisma.team.findFirst({
    where: { name: normalizedName, deletedAt: null },
    select: { id: true },
  });

  if (existingTeam) {
    throw new Error("Team-Name bereits vergeben.");
  }

  const teamId = crypto.randomUUID();
  const [team] = await prisma.$transaction([
    prisma.team.create({
      data: { id: teamId, name: normalizedName },
    }),
    prisma.teamMember.create({
      data: {
        userId: creatorUserId,
        teamId,
        role: "TRAINER",
      },
    }),
  ]);

  return team;
}

export async function renameTeam(teamId: string, newName: string) {
  const normalizedName = assertValidTeamName(newName);

  const existingTeam = await prisma.team.findFirst({
    where: { name: normalizedName, deletedAt: null },
    select: { id: true },
  });

  if (existingTeam && existingTeam.id !== teamId) {
    throw new Error("Team-Name bereits vergeben.");
  }

  return prisma.team.update({
    where: { id: teamId },
    data: { name: normalizedName },
  });
}

export async function deleteTeam(teamId: string) {
  await prisma.team.update({
    where: { id: teamId },
    data: { deletedAt: new Date() },
  });

  await prisma.user.updateMany({
    where: { activeTeamId: teamId },
    data: { activeTeamId: null },
  });
}
