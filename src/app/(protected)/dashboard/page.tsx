import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { Card } from "@/components/Card";
import { requireAuth } from "@/lib/guards";
import { env } from "@/lib/env";
import { createTeamInvite } from "@/lib/teamInvites";
import { sendTeamInviteEmail } from "@/lib/mailer";

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

type DashboardPageProps = {
  searchParams?: { invite?: string };
};

const inviteMessages: Record<string, string> = {
  sent: "Einladung versendet.",
  error: "Einladung konnte nicht gesendet werden.",
  forbidden: "Nur Trainer duerfen Einladungen senden.",
  missing_team: "Aktives Team fehlt.",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuth();
  const activeMembershipRole = user.memberships?.find(
    (membership) => membership.teamId === user.activeTeamId
  )?.role;
  const roleLabel = activeMembershipRole ?? "—";
  const cards = activeMembershipRole ? roleCards[activeMembershipRole] ?? [] : [];
  const teamName = user.activeTeam?.name ?? "Nicht zugeordnet";
  const inviteMessage = searchParams?.invite
    ? inviteMessages[searchParams.invite]
    : null;

  async function inviteAction(formData: FormData) {
    "use server";

    const sessionUser = await requireAuth();
    const teamId = sessionUser.activeTeamId;

    if (!teamId) {
      redirect("/dashboard?invite=missing_team");
    }

    const role = sessionUser.memberships?.find(
      (membership) => membership.teamId === teamId
    )?.role;

    if (role !== Role.TRAINER) {
      redirect("/dashboard?invite=forbidden");
    }

    const emailValue = String(formData.get("email") ?? "").trim();
    const roleValue = String(formData.get("role") ?? "").trim();
    const inviteRole =
      roleValue === Role.PARENT || roleValue === Role.PLAYER
        ? roleValue
        : null;

    if (!emailValue || !inviteRole) {
      redirect("/dashboard?invite=error");
    }

    try {
      const { token } = await createTeamInvite({
        teamId,
        email: emailValue,
        role: inviteRole,
      });
      const inviteLink = new URL(`/join/${token}`, env.APP_URL).toString();
      const inviteTeamName = sessionUser.activeTeam?.name ?? "Team";

      await sendTeamInviteEmail({
        to: emailValue,
        inviteLink,
        teamName: inviteTeamName,
        role: inviteRole,
      });

      redirect("/dashboard?invite=sent");
    } catch {
      redirect("/dashboard?invite=error");
    }
  }

  return (
    <div className="page">
      <main className="container stack">
        <div className="toolbar">
          <div className="stack">
            <span className="pill">Rolle: {roleLabel}</span>
            <h1>Dashboard</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="button button--secondary" type="submit">
              Logout
            </button>
          </form>
        </div>
        <p className="subtitle">
          Dein rollenbasiertes Dashboard ist vorbereitet. Inhalte folgen.
        </p>
        {inviteMessage ? <p className="subtitle">{inviteMessage}</p> : null}
        <Card title="Account">
          <div className="stack">
            <p className="subtitle">E-Mail: {user.email}</p>
            <p className="subtitle">Rolle: {roleLabel}</p>
            <p className="subtitle">
              Team: {teamName}
            </p>
          </div>
        </Card>
        {activeMembershipRole === Role.TRAINER ? (
          <Card title="Mitglied einladen">
            <form className="stack" action={inviteAction}>
              <label className="stack">
                <span className="subtitle">E-Mail</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  required
                />
              </label>
              <label className="stack">
                <span className="subtitle">Rolle</span>
                <select className="input" name="role" defaultValue={Role.PARENT}>
                  <option value={Role.PARENT}>PARENT</option>
                  <option value={Role.PLAYER}>PLAYER</option>
                </select>
              </label>
              <button className="button button--primary" type="submit">
                Einladung senden
              </button>
            </form>
          </Card>
        ) : null}
        <div className="grid">
          {cards.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              description={card.description}
              disabled
            />
          ))}
        </div>
      </main>
    </div>
  );
}
