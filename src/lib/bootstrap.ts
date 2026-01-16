import "server-only";

import { Role } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Stellt sicher, dass es einen initialen Trainer + Team gibt.
 * Wenn schon irgendein TeamMember existiert, macht die Funktion nichts.
 * Wenn noch keiner existiert, wird fuer den uebergebenen User:
 *  - ein erstes Team angelegt,
 *  - eine TeamMember-Relation mit Rolle TRAINER erstellt,
 *  - activeTeamId auf dieses Team gesetzt.
 */
export async function ensureInitialTrainerForUser(userId: string) {
  const existingMember = await prisma.teamMember.findFirst({
    select: { id: true },
  });

  if (existingMember) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isSystemAdmin: true },
  });

  if (!user || !user.isSystemAdmin) {
    return;
  }

  const team = await prisma.team.create({
    data: {
      name: "Mein erstes Team",
    },
  });

  await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId: team.id,
      role: Role.TRAINER,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      activeTeamId: team.id,
    },
  });
}
