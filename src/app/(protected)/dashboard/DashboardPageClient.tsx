"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import type { SimpleTeamMember, TeamMembersForUser, UserTeam } from "@/lib/teams";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TeamMembersList } from "./TeamMembersList";

type CardItem = {
  title: string;
  description: string;
};

type DashboardPageClientProps = {
  roleLabel: string;
  cards: CardItem[];
  teamName: string;
  isSystemAdmin: boolean;
  userEmail: string;
  inviteAction: (
    prevState: InviteState,
    formData: FormData
  ) => Promise<InviteState>;
  teamMembers: SimpleTeamMember[];
  currentUserRole: TeamMembersForUser["currentUserRole"];
  teams: UserTeam[];
  switchActiveTeamAction: (formData: FormData) => Promise<void>;
};

type InviteState = {
  ok: boolean;
  error?: string;
  inviteUrl?: string;
  email?: string;
};

export function DashboardPageClient(props: DashboardPageClientProps) {
  const {
    roleLabel,
    cards,
    teamName,
    isSystemAdmin,
    userEmail,
    inviteAction,
    teamMembers,
    currentUserRole,
    teams,
    switchActiveTeamAction,
  } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copySuccess, setCopySuccess] = useState(false);
  const [inviteState, inviteFormAction, invitePending] = useActionState(
    inviteAction,
    { ok: true }
  );
  const hasMultipleTeams = teams.length > 1;
  const activeTeam = teams.find((team) => team.isActive) ?? teams[0] ?? null;

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
        <Card title="Account">
          <div className="stack">
            <p className="subtitle">E-Mail: {userEmail}</p>
            <p className="subtitle">Rolle: {roleLabel}</p>
            <p className="subtitle">Team: {teamName}</p>
          </div>
        </Card>
        {hasMultipleTeams && activeTeam ? (
          <Card title="Aktives Team">
            <form
              className="stack"
              action={(formData) => {
                startTransition(async () => {
                  await switchActiveTeamAction(formData);
                  router.refresh();
                });
              }}
            >
              <label className="stack">
                <span className="subtitle">Team auswaehlen</span>
                <select
                  className="input"
                  name="teamId"
                  defaultValue={activeTeam.id}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                      {team.isActive ? " (aktuell)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button button--primary"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Wechselt..." : "Team wechseln"}
              </button>
            </form>
          </Card>
        ) : null}
        {isSystemAdmin ? (
          <Card
            title="Mitglied einladen"
            description="Nur System-Admins koennen hier Einladungen an Eltern und Spieler verschicken."
          >
            <form className="stack" action={inviteFormAction}>
              <label className="stack">
                <span className="subtitle">E-Mail</span>
                <input className="input" type="email" name="email" required />
              </label>
              <label className="stack">
                <span className="subtitle">Rolle</span>
                <select className="input" name="role" defaultValue="PARENT">
                  <option value="PARENT">PARENT</option>
                  <option value="PLAYER">PLAYER</option>
                </select>
              </label>
              <Button type="submit" disabled={invitePending}>
                Einladung senden
              </Button>
            </form>
            {!inviteState.ok ? (
              <p className="subtitle">{inviteState.error}</p>
            ) : null}
            {inviteState.inviteUrl ? (
              <div className="stack">
                <p className="subtitle">
                  Einladung an {inviteState.email} wurde verschickt.
                </p>
                <label className="stack">
                  <span className="subtitle">
                    Direkter Einladungslink (z. B. fuer WhatsApp):
                  </span>
                  <input
                    className="input"
                    value={inviteState.inviteUrl}
                    readOnly
                  />
                  <button
                    type="button"
                    className="button"
                    // NOTE: natives <button> statt <Button>, da ButtonProps kein onClick unterstützt
                    onClick={async () => {
                      if (inviteState.inviteUrl && navigator?.clipboard?.writeText) {
                        await navigator.clipboard.writeText(inviteState.inviteUrl);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }
                    }}
                  >
                    Link kopieren
                  </button>
                  {copySuccess ? (
                    <div className="badge badge--success">
                      Link kopiert – du kannst ihn jetzt z. B. in WhatsApp
                      einfuegen.
                    </div>
                  ) : null}
                </label>
              </div>
            ) : null}
          </Card>
        ) : null}
        <TeamMembersList
          members={teamMembers}
          currentUserRole={currentUserRole}
        />
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
