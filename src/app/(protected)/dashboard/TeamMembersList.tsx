"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import type { TeamMemberWithUser } from "@/lib/teams";

import { Card } from "@/components/Card";

type MemberWithUser = TeamMemberWithUser & {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

type TeamMembersListProps = {
  members: MemberWithUser[];
  canManageMembers: boolean;
  updateTeamMemberRoleAction: (formData: FormData) => Promise<void>;
  removeTeamMemberAction: (formData: FormData) => Promise<void>;
  withCard?: boolean;
};

export function TeamMembersList({
  members,
  canManageMembers,
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
  withCard = true,
}: TeamMembersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [savedMemberId, setSavedMemberId] = useState<string | null>(null);

  function handleRoleSubmit(
    event: FormEvent<HTMLFormElement>,
    memberId: string
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setActiveMemberId(memberId);
    startTransition(async () => {
      await updateTeamMemberRoleAction(formData);
      router.refresh();
      setSavedMemberId(memberId);
      setTimeout(() => setSavedMemberId(null), 2000);
      setActiveMemberId(null);
    });
  }

  function handleRemoveSubmit(
    event: FormEvent<HTMLFormElement>,
    memberId: string
  ) {
    if (!window.confirm("Dieses Mitglied wirklich entfernen?")) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setActiveMemberId(memberId);
    startTransition(async () => {
      await removeTeamMemberAction(formData);
      router.refresh();
      setActiveMemberId(null);
    });
  }

  const content = (
    <div className="space-y-3">
      {members.length === 0 ? (
        <p className="subtitle">Noch keine Mitglieder in diesem Team.</p>
      ) : (
        members.map((member) => {
          const email = member.user.email ?? "Unbekannt";
          const displayName = getDisplayName(member);
          const isActive = activeMemberId === member.id;
          const isSaved = savedMemberId === member.id;
          const roleBadge = getRoleBadgeClass(member.role);

          return (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="member-avatar">
                    {getMemberInitials(displayName, email)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">{email}</p>
                  </div>
                </div>
                <span className={`badge ${roleBadge}`}>{member.role}</span>
              </div>

              {canManageMembers ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(event) => handleRoleSubmit(event, member.id)}
                  >
                    <input type="hidden" name="memberId" value={member.id} />
                    <select
                      className="input"
                      name="role"
                      defaultValue={member.role}
                    >
                      <option value="TRAINER">TRAINER</option>
                      <option value="PARENT">PARENT</option>
                      <option value="PLAYER">PLAYER</option>
                    </select>
                    <button
                      type="submit"
                      className="button button--secondary button--compact"
                      disabled={isPending && isActive}
                    >
                      {isPending && isActive ? "Speichert..." : "Speichern"}
                    </button>
                    {isSaved ? (
                      <span className="badge badge--success">Gespeichert</span>
                    ) : null}
                  </form>
                  <form onSubmit={(event) => handleRemoveSubmit(event, member.id)}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button
                      type="submit"
                      className="button button--secondary button--compact"
                      disabled={isPending && isActive}
                    >
                      {isPending && isActive ? "Entfernt..." : "Entfernen"}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );

  if (!withCard) {
    return content;
  }

  return (
    <Card title="Teammitglieder" description="Alle Spieler:innen, Eltern und Trainer.">
      {content}
    </Card>
  );
}

function getDisplayName(member: MemberWithUser) {
  const { firstName, lastName, email } = member.user;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  return getFallbackNameFromEmail(email ?? "");
}

function getFallbackNameFromEmail(email: string) {
  if (!email.includes("@")) return email || "Unbekannt";
  const namePart = email.split("@")[0] ?? email;
  const cleaned = namePart.replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : email;
}

function getMemberInitials(displayName: string, email: string) {
  if (displayName) {
    const parts = displayName.split(" ").filter(Boolean);
    const initials = parts.map((part) => part[0]).join("").slice(0, 2);
    if (initials) return initials.toUpperCase();
  }
  const base = email.split("@")[0] ?? "SV";
  const cleaned = base.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 2) || "SV";
}

function getRoleBadgeClass(role: string) {
  if (role === "TRAINER") return "badge--trainer";
  if (role === "PARENT") return "badge--parent";
  if (role === "PLAYER") return "badge--player";
  return "badge--neutral";
}
