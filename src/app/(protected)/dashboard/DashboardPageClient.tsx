"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition, type ReactNode } from "react";

import type { AdminTeam, TeamMemberWithUser, UserTeam } from "@/lib/teams";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TeamMembersList } from "./TeamMembersList";

type DashboardPageClientProps = {
  roleLabel: string;
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

type RoleMeta = {
  label: string;
  badgeClass: string;
};

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  targetId?: string;
  disabled?: boolean;
  targetTab?: "members" | "invite" | "teams";
};

const roleMetaMap: Record<string, RoleMeta> = {
  TRAINER: { label: "Trainer", badgeClass: "badge--trainer" },
  COACH: { label: "Trainer", badgeClass: "badge--trainer" },
  MANAGER: { label: "Trainer", badgeClass: "badge--trainer" },
  PARENT: { label: "Eltern", badgeClass: "badge--parent" },
  PLAYER: { label: "Spieler", badgeClass: "badge--player" },
};

function getRoleMeta(roleLabel: string) {
  return roleMetaMap[roleLabel] ?? {
    label: roleLabel === "—" ? "Ohne Team" : roleLabel,
    badgeClass: "badge--neutral",
  };
}

export function DashboardPageClient(props: DashboardPageClientProps) {
  const {
    roleLabel,
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
  const [activeTab, setActiveTab] = useState<"members" | "invite" | "teams">(
    "members"
  );
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

  const roleMeta = getRoleMeta(roleLabel);
  const quickActions: QuickAction[] = [
    {
      id: "invite",
      title: "Mitglied einladen",
      description: "Neue Spieler:innen oder Eltern hinzufügen",
      icon: <UsersIcon />,
      targetId: "team-management",
      targetTab: "invite",
      disabled: !isSystemAdmin,
    },
    {
      id: "events",
      title: "Termine",
      description: "Trainings, Spiele, Teamevents",
      icon: <CalendarIcon />,
      targetId: "events",
    },
    {
      id: "matches",
      title: "Spiele",
      description: "Matchday im Blick",
      icon: <TrophyIcon />,
      targetId: "events",
    },
    {
      id: "team",
      title: "Team verwalten",
      description: "Mitglieder, Einladungen, Teams",
      icon: <TeamIcon />,
      targetId: "team-management",
      targetTab: "members",
    },
  ];

  return (
    <div className="page">
      <main className="container">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
          <header className="dashboard__header">
            <div className="dashboard__title">
              <div className="dashboard__team">
                <div>
                  <p className="dashboard__label">Team</p>
                  <h1 className="dashboard__team-name">{teamName}</h1>
                </div>
                <span className={`badge ${roleMeta.badgeClass}`}>
                  {roleMeta.label}
                </span>
                {activeTeam ? (
                  <span className="badge badge--neutral">Aktives Team</span>
                ) : null}
              </div>
              <p className="dashboard__subtitle">Dein Team-Hub</p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="button button--secondary dashboard__logout" type="submit">
                Logout
              </button>
            </form>
          </header>

          <section aria-label="Schnellzugriffe">
            <div className="quick-actions">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`quick-action ${action.disabled ? "quick-action--disabled" : ""}`}
                  disabled={action.disabled}
                  onClick={() => {
                    if (action.disabled || !action.targetId) return;
                    if (action.targetTab) {
                      setActiveTab(action.targetTab);
                    }
                    document
                      .getElementById(action.targetId)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="quick-action__icon">{action.icon}</span>
                  <span className="quick-action__text">
                    <strong>{action.title}</strong>
                    <span className="quick-action__subtitle">{action.description}</span>
                  </span>
                  {action.disabled ? (
                    <span className="badge badge--neutral">Nur Admin</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
            <section className="space-y-4">
              <Card title="Profil">
                <div className="profile-card">
                  <div className="profile-card__avatar">
                    {getInitials(userEmail)}
                  </div>
                  <div className="profile-card__details">
                    <p className="profile-card__name">{userEmail}</p>
                    <p className="subtitle">Rolle: {roleMeta.label}</p>
                    <p className="subtitle">Team: {teamName}</p>
                  </div>
                </div>
                {showTeamSwitcher ? (
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
                      <span className="subtitle">Aktives Team</span>
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
                ) : null}
              </Card>

              <Card
                title="Naechste Termine"
                description="Kurzuebersicht fuer Training, Spiele und Team-Events."
              >
                <ul className="events-list" id="events">
                  <li className="event-item items-center justify-between">
                    <span className="event-item__icon">
                      <WhistleIcon />
                    </span>
                    <div>
                      <strong>Training</strong>
                      <p className="subtitle">Dienstag, 17:30 Uhr</p>
                    </div>
                    <span className="badge badge--trainer">Training</span>
                  </li>
                  <li className="event-item items-center justify-between">
                    <span className="event-item__icon">
                      <TrophyIcon />
                    </span>
                    <div>
                      <strong>Spieltag</strong>
                      <p className="subtitle">Samstag, 11:00 Uhr</p>
                    </div>
                    <span className="badge badge--player">Spiel</span>
                  </li>
                  <li className="event-item items-center justify-between">
                    <span className="event-item__icon">
                      <ChatIcon />
                    </span>
                    <div>
                      <strong>Team-Event</strong>
                      <p className="subtitle">Teambuilding · Coming soon</p>
                    </div>
                    <span className="badge badge--neutral">Event</span>
                  </li>
                </ul>
              </Card>
            </section>

            <section className="space-y-4" id="team-management">
              <Card title="Team-Management">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 text-sm">
                    {[
                      { key: "members", label: "Mitglieder" },
                      { key: "invite", label: "Mitglied einladen" },
                      { key: "teams", label: "Teams" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                          activeTab === tab.key
                            ? "bg-white text-emerald-700 shadow"
                            : "text-slate-500"
                        }`}
                        onClick={() =>
                          setActiveTab(tab.key as "members" | "invite" | "teams")
                        }
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "members" ? (
                    <TeamMembersList
                      members={teamMembers}
                      canManageMembers={canManageMembers}
                      updateTeamMemberRoleAction={updateTeamMemberRoleAction}
                      removeTeamMemberAction={removeTeamMemberAction}
                      withCard={false}
                    />
                  ) : null}

                  {activeTab === "invite" ? (
                    <div>
                      {isSystemAdmin ? (
                        <form className="stack" action={inviteFormAction}>
                          <label className="stack">
                            <span className="subtitle">Vorname</span>
                            <input
                              className="input"
                              type="text"
                              name="firstName"
                              required
                            />
                          </label>
                          <label className="stack">
                            <span className="subtitle">Nachname</span>
                            <input
                              className="input"
                              type="text"
                              name="lastName"
                              required
                            />
                          </label>
                          <label className="stack">
                            <span className="subtitle">E-Mail</span>
                            <input
                              className="input"
                              type="email"
                              name="email"
                              placeholder="name@beispiel.de"
                              required
                            />
                          </label>
                          <label className="stack">
                            <span className="subtitle">Rolle</span>
                            <select className="input" name="role" defaultValue="PARENT">
                              <option value="PARENT">ELTERN</option>
                              <option value="PLAYER">SPIELER</option>
                              <option value="TRAINER">TRAINER</option>
                            </select>
                          </label>
                          <Button type="submit" disabled={invitePending}>
                            {invitePending ? "Sende..." : "Einladung senden"}
                          </Button>
                          <p className="subtitle">
                            Einladungslink wird automatisch per E-Mail verschickt.
                          </p>
                        </form>
                      ) : (
                        <p className="subtitle">
                          Einladungen koennen aktuell nur System-Admins senden.
                        </p>
                      )}
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
                              Direkter Einladungslink (WhatsApp o. a.):
                            </span>
                            <input
                              className="input"
                              value={inviteState.inviteUrl}
                              readOnly
                            />
                            <button
                              type="button"
                              className="button button--secondary"
                              // NOTE: natives <button> statt <Button>, da ButtonProps kein onClick unterstützt
                              onClick={async () => {
                                if (
                                  inviteState.inviteUrl &&
                                  navigator?.clipboard?.writeText
                                ) {
                                  await navigator.clipboard.writeText(
                                    inviteState.inviteUrl
                                  );
                                  setCopySuccess(true);
                                  setTimeout(() => setCopySuccess(false), 2000);
                                }
                              }}
                            >
                              Link kopieren
                            </button>
                            {copySuccess ? (
                              <div className="badge badge--success">
                                Kopiert! Jetzt teilen.
                              </div>
                            ) : null}
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTab === "teams" ? (
                    <div className="stack">
                      <div className="stack">
                        {isSystemAdmin ? (
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => setShowCreateForm((current) => !current)}
                          >
                            Neues Team anlegen
                          </button>
                        ) : null}
                        {showCreateForm && isSystemAdmin ? (
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
                      <div className="stack">
                        {(isSystemAdmin ? adminTeams : teams).length === 0 ? (
                          <p className="subtitle">Noch keine Teams vorhanden.</p>
                        ) : (
                          (isSystemAdmin ? adminTeams : teams).map((team) => (
                            <div key={team.id} className="card">
                              <div className="stack">
                                <div className="flex items-center justify-between gap-2">
                                  <strong>{team.name}</strong>
                                  {"isActive" in team && team.isActive ? (
                                    <span className="badge badge--neutral">
                                      Aktives Team
                                    </span>
                                  ) : null}
                                </div>
                                {"_count" in team ? (
                                  <span className="subtitle">
                                    Mitglieder: {team._count?.members ?? 0}
                                  </span>
                                ) : (
                                  <span className="subtitle">Dein Team</span>
                                )}
                                {isSystemAdmin ? (
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
                                        <input
                                          type="hidden"
                                          name="teamId"
                                          value={team.id}
                                        />
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
                                          <input
                                            type="hidden"
                                            name="teamId"
                                            value={team.id}
                                          />
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
                                ) : null}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function getInitials(email: string) {
  const safeEmail = email?.trim() ?? "";
  const namePart = safeEmail.split("@")[0] ?? "";
  if (!namePart) return "SV";
  const cleaned = namePart.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 2) || "SV";
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" fill="currentColor" />
      <rect x="6" y="3" width="2" height="4" fill="currentColor" />
      <rect x="16" y="3" width="2" height="4" fill="currentColor" />
      <rect x="6" y="11" width="4" height="2" fill="white" />
      <rect x="12" y="11" width="4" height="2" fill="white" />
      <rect x="6" y="15" width="4" height="2" fill="white" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="9" r="3" fill="currentColor" />
      <circle cx="16" cy="10" r="2.5" fill="currentColor" />
      <path
        d="M3 19c0-3 3-5 5-5s5 2 5 5"
        fill="currentColor"
      />
      <path d="M12 19c0-2 2-4 4-4s4 2 4 4" fill="currentColor" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 4h12v2a5 5 0 0 1-4 4v2h2v2H8v-2h2V10a5 5 0 0 1-4-4V4z"
        fill="currentColor"
      />
      <rect x="9" y="16" width="6" height="4" fill="currentColor" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <circle cx="16" cy="8" r="3" fill="currentColor" />
      <path d="M4 19c0-2.5 2-4.5 4.5-4.5S13 16.5 13 19" fill="currentColor" />
      <path d="M11 19c0-2.5 2-4.5 4.5-4.5S20 16.5 20 19" fill="currentColor" />
    </svg>
  );
}

function WhistleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="15" r="4" fill="currentColor" />
      <rect x="12" y="10" width="8" height="4" rx="2" fill="currentColor" />
      <rect x="4" y="6" width="8" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="12" rx="3" fill="currentColor" />
      <path d="M8 17l-2 3 4-3" fill="currentColor" />
    </svg>
  );
}
