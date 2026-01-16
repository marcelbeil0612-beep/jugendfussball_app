import "server-only";

import { Resend } from "resend";

import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendMagicLinkEmail(params: {
  to: string;
  magicLink: string;
}) {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: "Dein Login-Link",
    text: `Hallo!\n\nHier ist dein Magic Link:\n${params.magicLink}\n\nDer Link ist ${15} Minuten gueltig.`,
  });
}
