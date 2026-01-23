import { redirect } from "next/navigation";
import { z } from "zod";

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-start px-4 pb-16 pt-10 sm:pt-16">
        <p className="hidden text-sm font-semibold text-emerald-700 md:block">
          Jugendfussball Team-App
        </p>
        <div className="mt-4 w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex flex-col gap-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              SV Steinheim – Jugend-App
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Einloggen</h1>
            <p className="text-sm text-slate-500">
              Melde dich mit deiner Vereins-E-Mail und deinem Passwort an.
            </p>
          </div>
          <LoginForm action={loginWithPasswordAction} />
          <div className="mt-6 space-y-2 text-sm text-slate-500">
            <p>Du wurdest eingeladen? Nutze den Registrierungslink aus deiner E-Mail.</p>
            <p className="text-xs text-slate-400">
              Passwort vergessen? Funktion kommt spaeter – wende dich bis dahin an
              deinen Trainer.
            </p>
          </div>
        </div>
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
