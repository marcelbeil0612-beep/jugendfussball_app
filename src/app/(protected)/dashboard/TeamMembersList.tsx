"use client";

import type { TeamMemberWithUser } from "@/lib/teams";

import { Card } from "@/components/Card";

type TeamMembersListProps = {
  members: TeamMemberWithUser[];
  canManageMembers: boolean;
  updateTeamMemberRoleAction: (formData: FormData) => Promise<void>;
  removeTeamMemberAction: (formData: FormData) => Promise<void>;
};

export function TeamMembersList({
  members,
  canManageMembers,
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
}: TeamMembersListProps) {
  return (
    <Card title="Mitglieder">
      <div className="stack">
        {members.length === 0 ? (
          <p className="subtitle">Keine Mitglieder fuer dieses Team gefunden.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
                {canManageMembers ? <th>Aktionen</th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.email ?? "Unbekannt"}</td>
                  <td>{member.user.email}</td>
                  <td>
                    {canManageMembers ? (
                      <form className="stack" action={updateTeamMemberRoleAction}>
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
                        <button type="submit" className="button button--secondary">
                          Speichern
                        </button>
                      </form>
                    ) : (
                      member.role
                    )}
                  </td>
                  {canManageMembers ? (
                    <td>
                      <form
                        action={removeTeamMemberAction}
                        onSubmit={(event) => {
                          if (
                            !window.confirm(
                              "Dieses Mitglied wirklich entfernen?"
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="memberId" value={member.id} />
                        <button type="submit" className="button button--secondary">
                          Entfernen
                        </button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
