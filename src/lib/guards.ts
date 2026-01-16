import "server-only";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
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
