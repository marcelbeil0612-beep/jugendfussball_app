import { redirect } from "next/navigation";
import { z } from "zod";

import { Card } from "@/components/Card";
import { verifyPassword } from "@/lib/auth-password";
import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const runtime = "nodejs";

type ActionState = { ok: boolean; error?: string };

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function LoginPage() {
  return (
    <div className="page">
      <main className="container stack">
        <Card
          title="Einloggen"
          description="Melde dich mit deiner E-Mail und deinem Passwort an."
        >
          <LoginForm action={loginWithPasswordAction} />
          <div className="stack">
            <p className="subtitle">
              Du wurdest eingeladen? Nutze den Registrierungslink aus deiner
              E-Mail.
            </p>
            <p className="subtitle">Passwort vergessen? (kommt spaeter)</p>
          </div>
        </Card>
      </main>
    </div>
  );
}

async function loginWithPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Bitte E-Mail und Passwort pruefen." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return { ok: false, error: "E-Mail oder Passwort falsch." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "E-Mail oder Passwort falsch." };
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  redirect("/dashboard");
}
