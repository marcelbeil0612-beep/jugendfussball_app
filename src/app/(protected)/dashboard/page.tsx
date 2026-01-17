import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth, requireSystemAdmin } from "@/lib/guards";
import { env } from "@/lib/env";
import { createTeamInvite } from "@/lib/teamInvites";
import { sendTeamInviteEmail } from "@/lib/mailer";
import {
  createTeam,
  deleteTeam,
  getAllTeamsForAdmin,
  getMembersForActiveTeam,
  getTeamsForUser,
  renameTeam,
  setActiveTeam,
} from "@/lib/teams";
import { DashboardPageClient } from "./DashboardPageClient";

export const runtime = "nodejs";

type CardItem = {
  title: string;
  description: string;
};

const trainerCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
  { title: "Zusagen", description: "Coming soon" },
  { title: "Fahrdienst", description: "Coming soon" },
  { title: "Kommunikation", description: "Coming soon" },
  { title: "Team", description: "Coming soon" },
  { title: "Training", description: "Coming soon" },
  { title: "Spiel", description: "Coming soon" },
  { title: "CoachGPT", description: "Coming soon" },
];

const parentCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
  { title: "Fahrdienst", description: "Coming soon" },
  { title: "Ankuendigungen", description: "Coming soon" },
];

const playerCards: CardItem[] = [
  { title: "Termine", description: "Coming soon" },
];

const roleCards: Record<Role, CardItem[]> = {
  TRAINER: trainerCards,
  COACH: trainerCards,
  MANAGER: trainerCards,
  PARENT: parentCards,
  PLAYER: playerCards,
};

type InviteState = {
  ok: boolean;
  error?: string;
  inviteUrl?: string;
  email?: string;
};

export async function createTeamAction(formData: FormData) {
  "use server";

  const user = await requireSystemAdmin();
  const teamName = String(formData.get("teamName") ?? "");

  if (!teamName.trim()) {
    return { ok: false, error: "Team-Name fehlt." };
  }

  try {
    await createTeam(teamName, user.id);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Team konnte nicht erstellt werden." };
  }
}

export async function renameTeamAction(formData: FormData) {
  "use server";

  await requireSystemAdmin();
  const teamId = String(formData.get("teamId") ?? "");
  const newName = String(formData.get("newName") ?? "");

  if (!teamId || !newName.trim()) {
    return { ok: false, error: "Team-Name fehlt." };
  }

  try {
    await renameTeam(teamId, newName);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Team konnte nicht umbenannt werden." };
  }
}

export async function deleteTeamAction(formData: FormData) {
  "use server";

  await requireSystemAdmin();
  const teamId = String(formData.get("teamId") ?? "");

  if (!teamId) {
    return { ok: false, error: "Team fehlt." };
  }

  try {
    await deleteTeam(teamId);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Team konnte nicht geloescht werden." };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const activeMembershipRole = user.memberships?.find(
    (membership) => membership.teamId === user.activeTeamId
  )?.role;
  const roleLabel = activeMembershipRole ?? "—";
  const cards = activeMembershipRole ? roleCards[activeMembershipRole] ?? [] : [];
  const teamName = user.activeTeam?.name ?? "Nicht zugeordnet";
  const teamMembersForUser = await getMembersForActiveTeam(user.id);
  const userTeams = await getTeamsForUser(user.id);
  const isSystemAdmin = user.isSystemAdmin;
  const adminTeams = isSystemAdmin ? await getAllTeamsForAdmin() : [];

  async function switchActiveTeamAction(formData: FormData) {
    "use server";

    const teamId = formData.get("teamId");

    if (typeof teamId !== "string" || !teamId) {
      return;
    }

    const sessionUser = await requireAuth();
    await setActiveTeam(sessionUser.id, teamId);
  }

  async function inviteAction(
    _prevState: InviteState,
    formData: FormData
  ): Promise<InviteState> {
    "use server";

    const sessionUser = await requireSystemAdmin();
    const teamId = sessionUser.activeTeamId;

    if (!teamId) {
      return { ok: false, error: "Aktives Team fehlt." };
    }

    const firstNameValue = String(formData.get("firstName") ?? "").trim();
    const lastNameValue = String(formData.get("lastName") ?? "").trim();
    const emailValue = String(formData.get("email") ?? "").trim();
    const roleValue = String(formData.get("role") ?? "").trim();
    const inviteRole =
      roleValue === Role.PARENT ||
      roleValue === Role.PLAYER ||
      roleValue === Role.TRAINER
        ? roleValue
        : null;

    if (!firstNameValue || !lastNameValue) {
      return { ok: false, error: "Bitte Vorname und Nachname pruefen." };
    }

    if (!emailValue || !inviteRole) {
      return { ok: false, error: "Bitte E-Mail und Rolle pruefen." };
    }

    try {
      const invite = await createTeamInvite({
        teamId,
        email: emailValue,
        role: inviteRole,
        firstName: firstNameValue,
        lastName: lastNameValue,
      });
      const inviteLink = new URL(`/join/${invite.token}`, env.APP_URL).toString();
      const inviteTeamName = sessionUser.activeTeam?.name ?? "Team";

      await sendTeamInviteEmail({
        to: emailValue,
        inviteLink,
        teamName: inviteTeamName,
        role: inviteRole,
      });

      return { ok: true, inviteUrl: inviteLink, email: emailValue };
    } catch {
      return { ok: false, error: "Einladung konnte nicht gesendet werden." };
    }
  }

  return (
    <DashboardPageClient
      roleLabel={roleLabel}
      cards={cards}
      teamName={teamName}
      isSystemAdmin={isSystemAdmin}
      userEmail={user.email}
      inviteAction={inviteAction}
      teamMembers={teamMembersForUser.members}
      currentUserRole={teamMembersForUser.currentUserRole}
      teams={userTeams}
      switchActiveTeamAction={switchActiveTeamAction}
      adminTeams={adminTeams}
      createTeamAction={createTeamAction}
      renameTeamAction={renameTeamAction}
      deleteTeamAction={deleteTeamAction}
    />
  );
}
