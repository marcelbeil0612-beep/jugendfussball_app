import { redirect } from "next/navigation";

import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { acceptTeamInvite } from "@/lib/teamInvites";

type PageProps = {
  params: { token: string };
};

export default async function JoinPage(pageProps: PageProps) {
  const params = await pageProps.params;
  if (!params?.token || typeof params.token !== "string") {
    console.warn("JoinPage ohne gueltigen Token aufgerufen", { params });
    return (
      <div className="page">
        <main className="container stack">
          <h1>Einladung ungueltig</h1>
          <a className="button button--secondary" href="/auth/login">
            Zurueck zum Login
          </a>
        </main>
      </div>
    );
  }

  const token = params.token;
  console.log("JOIN_DEBUG: start join flow", { token });

  try {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      select: { email: true, usedAt: true, expiresAt: true },
    });

    if (!invite) {
      console.warn("JOIN_FAIL: invite not found", { token });
      throw new Error("Invite not found");
    }

    if (invite.usedAt) {
      console.warn("JOIN_FAIL: invite already used", { token, usedAt: invite.usedAt });
      throw new Error("Invite used");
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      console.warn("JOIN_FAIL: invite expired", { token, expiresAt: invite.expiresAt });
      throw new Error("Invite expired");
    }

    const email = invite.email.trim().toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true, passwordHash: true },
    });
    console.log("JOIN_DEBUG: user upserted", {
      userId: user.id,
      hasPassword: !!user.passwordHash,
    });

    await acceptTeamInvite({ token, userId: user.id });
    console.log("JOIN_DEBUG: acceptTeamInvite success", { token, userId: user.id });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);
    console.log("JOIN_DEBUG: session created & cookie set", { userId: user.id });

    if (!user.passwordHash) {
      redirect("/auth/set-password");
    }

    redirect("/dashboard");
  } catch (error) {
    console.warn("JOIN_FAIL: catch reached", {
      token,
      error: error instanceof Error ? error.message : String(error),
    });
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
