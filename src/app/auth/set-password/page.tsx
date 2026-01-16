import { redirect } from "next/navigation";
import { z } from "zod";

import { Card } from "@/components/Card";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-password";
import { requireSession } from "@/lib/guards";
import { SetPasswordForm } from "./SetPasswordForm";

export const runtime = "nodejs";

type ActionState = { ok: boolean; error?: string };

const SetPasswordSchema = z
  .object({
    password: z.string().min(1),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwoerter muessen uebereinstimmen.",
    path: ["passwordConfirm"],
  });

export default async function SetPasswordPage() {
  const user = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (dbUser?.passwordHash) {
    redirect("/dashboard");
  }

  return (
    <div className="page">
      <main className="container stack">
        <Card
          title="Passwort festlegen"
          description="Bitte lege dein Passwort fuer zukuenftige Logins fest."
        >
          <SetPasswordForm action={setPasswordAction} />
        </Card>
      </main>
    </div>
  );
}

async function setPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";

  const raw = {
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  };

  const parsed = SetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Bitte Passwort-Eingaben pruefen.",
    };
  }

  const { password } = parsed.data;
  const user = await requireSession();
  const hash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  });

  redirect("/dashboard");
}
