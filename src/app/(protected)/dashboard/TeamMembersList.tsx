"use client";

import type { SimpleTeamMember, TeamMembersForUser } from "@/lib/teams";

import { Card } from "@/components/Card";

type TeamMembersListProps = {
  members: SimpleTeamMember[];
  currentUserRole: TeamMembersForUser["currentUserRole"];
};

export function TeamMembersList({
  members,
  currentUserRole,
}: TeamMembersListProps) {
  return (
    <Card title="Mitglieder">
      <div className="stack">
        {currentUserRole ? (
          <p className="subtitle">Deine Rolle in diesem Team: {currentUserRole}</p>
        ) : null}
        {members.length === 0 ? (
          <p className="subtitle">Keine Mitglieder fuer dieses Team gefunden.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rolle</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.memberId}>
                  <td>
                    {member.name}
                    {member.isCurrentUser ? " (du)" : ""}
                  </td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
