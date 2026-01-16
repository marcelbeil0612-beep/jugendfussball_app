import "server-only";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

export async function requireAuth() {
  const user = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, passwordHash: true },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  if (!dbUser.passwordHash) {
    redirect("/auth/set-password");
  }

  return user;
}

export async function requireSystemAdmin() {
  const user = await requireAuth();

  if (!user.isSystemAdmin) {
    throw new Error("Not allowed");
  }

  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  const activeRole = user.memberships?.find(
    (membership) => membership.teamId === user.activeTeamId
  )?.role;
  if (!activeRole || !allowedRoles.includes(activeRole)) {
    redirect("/unauthorized");
  }
  return user;
}
