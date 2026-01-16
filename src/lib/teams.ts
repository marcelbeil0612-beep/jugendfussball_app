import "server-only";

import type { Role } from "@prisma/client";

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
    where: { userId: user.id },
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
