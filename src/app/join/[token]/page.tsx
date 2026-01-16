import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { acceptTeamInvite } from "@/lib/teamInvites";

type PageProps = {
  params: { token: string };
};

export default async function JoinPage({ params }: PageProps) {
  const user = await getSessionUser();
  const token = params.token;

  if (!user) {
    const next = `/join/${token}`;
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  try {
    await acceptTeamInvite({ token, userId: user.id });
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
