import { redirect } from "next/navigation";

import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { acceptTeamInvite } from "@/lib/teamInvites";

type PageProps = {
  params: { token: string };
};

export default async function JoinPage({ params }: PageProps) {
  const token = params.token;

  try {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      select: { email: true, usedAt: true, expiresAt: true },
    });

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.usedAt) {
      throw new Error("Invite used");
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error("Invite expired");
    }

    const email = invite.email.trim().toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true, passwordHash: true },
    });

    await acceptTeamInvite({ token, userId: user.id });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    if (!user.passwordHash) {
      redirect("/auth/set-password");
    }

    redirect("/dashboard");
  } catch {
    return (
      <div className="page">
        <main className="container stack">
          <h1>Einladung ungueltig oder abgelaufen</h1>
          <a className="button button--secondary" href="/dashboard">
            Zurueck zum Dashboard
          </a>
        </main>
      </div>
    );
  }
}
