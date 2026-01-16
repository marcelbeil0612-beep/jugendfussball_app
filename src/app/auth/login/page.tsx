import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

type LoginPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const sent = resolvedSearchParams?.sent === "1";
  const error = resolvedSearchParams?.error === "token";

  return (
    <div className="page">
      <main className="container stack">
        <Card
          title="Magic-Link Login"
          description="Gib deine E-Mail ein, wir schicken dir einen Login-Link."
        >
          <form className="form" action={requestMagicLinkAction}>
            <label className="stack" htmlFor="email">
              <span>E-Mail</span>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@verein.de"
              />
            </label>
            <Button type="submit">Login-Link senden</Button>
          </form>
          {sent ? (
            <p className="subtitle">
              Wenn die E-Mail existiert, ist der Magic-Link unterwegs.
            </p>
          ) : null}
          {error ? (
            <p className="subtitle">
              Der Link ist ungueltig oder abgelaufen. Bitte neu anfordern.
            </p>
          ) : null}
        </Card>
      </main>
    </div>
  );
}

async function requestMagicLinkAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const { requestMagicLink } = await import("@/lib/auth");
  await requestMagicLink(email);
  redirect("/auth/login?sent=1");
}
