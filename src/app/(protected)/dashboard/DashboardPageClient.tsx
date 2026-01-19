"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import type {
  AdminTeam,
  TeamMemberWithUser,
  UserTeam,
} from "@/lib/teams";

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
  teamMembers: TeamMemberWithUser[];
  canManageMembers: boolean;
  updateTeamMemberRoleAction: (formData: FormData) => Promise<void>;
  removeTeamMemberAction: (formData: FormData) => Promise<void>;
  teams: UserTeam[];
  switchActiveTeamAction: (formData: FormData) => Promise<void>;
  adminTeams: AdminTeam[];
  createTeamAction: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  renameTeamAction: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteTeamAction: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
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
    canManageMembers,
    updateTeamMemberRoleAction,
    removeTeamMemberAction,
    teams,
    switchActiveTeamAction,
    adminTeams,
    createTeamAction,
    renameTeamAction,
    deleteTeamAction,
  } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [renamingTeamId, setRenamingTeamId] = useState<string | null>(null);
  const [inviteState, inviteFormAction, invitePending] = useActionState(
    inviteAction,
    { ok: true }
  );
  const activeTeam = teams.find((team) => team.isActive) ?? null;
  const showTeamSwitcher =
    teams.length > 0 && (teams.length > 1 || !activeTeam);

  function runAction(
    action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>,
    formData: FormData,
    onDone?: () => void
  ) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
      onDone?.();
    });
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
        <Card title="Account">
          <div className="stack">
            <p className="subtitle">E-Mail: {userEmail}</p>
            <p className="subtitle">Rolle: {roleLabel}</p>
            <p className="subtitle">Team: {teamName}</p>
          </div>
        </Card>
        {showTeamSwitcher ? (
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
                  defaultValue={activeTeam?.id ?? ""}
                >
                  {!activeTeam ? (
                    <option value="" disabled>
                      Kein Team ausgewaehlt
                    </option>
                  ) : null}
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
            description="Nur System-Admins koennen hier Einladungen an Trainer, Eltern und Spieler verschicken."
          >
            <form className="stack" action={inviteFormAction}>
              <label className="stack">
                <span className="subtitle">Vorname</span>
                <input className="input" type="text" name="firstName" required />
              </label>
              <label className="stack">
                <span className="subtitle">Nachname</span>
                <input className="input" type="text" name="lastName" required />
              </label>
              <label className="stack">
                <span className="subtitle">E-Mail</span>
                <input className="input" type="email" name="email" required />
              </label>
              <label className="stack">
                <span className="subtitle">Rolle</span>
                <select className="input" name="role" defaultValue="PARENT">
                  <option value="PARENT">PARENT</option>
                  <option value="PLAYER">PLAYER</option>
                  <option value="TRAINER">TRAINER</option>
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
        {isSystemAdmin ? (
          <Card
            title="Teams verwalten"
            description="Nur System-Admins koennen Teams erstellen, umbenennen und loeschen."
          >
            <div className="stack">
              <div className="stack">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setShowCreateForm((current) => !current)}
                >
                  Neues Team erstellen
                </button>
                {showCreateForm ? (
                  <form
                    className="stack"
                    action={(formData) =>
                      runAction(createTeamAction, formData, () =>
                        setShowCreateForm(false)
                      )
                    }
                  >
                    <label className="stack">
                      <span className="subtitle">Teamname</span>
                      <input
                        className="input"
                        name="teamName"
                        type="text"
                        minLength={3}
                        maxLength={60}
                        required
                      />
                    </label>
                    <div className="stack">
                      <Button type="submit" disabled={isPending}>
                        Team anlegen
                      </Button>
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
              {adminTeams.length === 0 ? (
                <p className="subtitle">Noch keine Teams vorhanden.</p>
              ) : (
                <div className="stack">
                  {adminTeams.map((team) => (
                    <div key={team.id} className="card">
                      <div className="stack">
                        <strong>{team.name}</strong>
                        <span className="subtitle">
                          Mitglieder: {team._count?.members ?? 0}
                        </span>
                        <div className="stack">
                          {renamingTeamId === team.id ? (
                            <form
                              className="stack"
                              action={(formData) =>
                                runAction(renameTeamAction, formData, () =>
                                  setRenamingTeamId(null)
                                )
                              }
                            >
                              <input type="hidden" name="teamId" value={team.id} />
                              <label className="stack">
                                <span className="subtitle">Neuer Name</span>
                                <input
                                  className="input"
                                  name="newName"
                                  type="text"
                                  defaultValue={team.name}
                                  minLength={3}
                                  maxLength={60}
                                  required
                                />
                              </label>
                              <div className="stack">
                                <Button type="submit" disabled={isPending}>
                                  Umbenennen
                                </Button>
                                <button
                                  type="button"
                                  className="button button--secondary"
                                  onClick={() => setRenamingTeamId(null)}
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="stack">
                              <button
                                type="button"
                                className="button button--secondary"
                                onClick={() => setRenamingTeamId(team.id)}
                              >
                                Umbenennen
                              </button>
                              <form
                                action={(formData) =>
                                  runAction(deleteTeamAction, formData)
                                }
                                onSubmit={(event) => {
                                  if (
                                    !window.confirm(
                                      "Dieses Team wirklich loeschen?"
                                    )
                                  ) {
                                    event.preventDefault();
                                  }
                                }}
                              >
                                <input type="hidden" name="teamId" value={team.id} />
                                <button
                                  type="submit"
                                  className="button button--secondary"
                                  disabled={isPending}
                                >
                                  Loeschen
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ) : null}
        <TeamMembersList
          members={teamMembers}
          canManageMembers={canManageMembers}
          updateTeamMemberRoleAction={updateTeamMemberRoleAction}
          removeTeamMemberAction={removeTeamMemberAction}
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
