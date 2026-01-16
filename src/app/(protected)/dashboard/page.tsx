import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireAuth, requireSystemAdmin } from "@/lib/guards";
import { env } from "@/lib/env";
import { createTeamInvite } from "@/lib/teamInvites";
import { sendTeamInviteEmail } from "@/lib/mailer";
import { getMembersForActiveTeam, getTeamsForUser, setActiveTeam } from "@/lib/teams";
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

    const emailValue = String(formData.get("email") ?? "").trim();
    const roleValue = String(formData.get("role") ?? "").trim();
    const inviteRole =
      roleValue === Role.PARENT || roleValue === Role.PLAYER
        ? roleValue
        : null;

    if (!emailValue || !inviteRole) {
      return { ok: false, error: "Bitte E-Mail und Rolle pruefen." };
    }

    try {
      const invite = await createTeamInvite({
        teamId,
        email: emailValue,
        role: inviteRole,
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
    />
  );
}
