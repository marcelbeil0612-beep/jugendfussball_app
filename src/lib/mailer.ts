import "server-only";

import { Role } from "@prisma/client";

import { sendEmail } from "@/lib/email";

export async function sendMagicLinkEmail(params: {
  to: string;
  magicLink: string;
}) {
  await sendEmail({
    to: params.to,
    subject: "Dein Login-Link",
    text: `Hallo!\n\nHier ist dein Magic Link:\n${params.magicLink}\n\nDer Link ist ${15} Minuten gueltig.`,
  });
}

export async function sendTeamInviteEmail(params: {
  to: string;
  inviteLink: string;
  teamName: string;
  role: Role;
}) {
  await sendEmail({
    to: params.to,
    subject: "Einladung zum Team",
    text: `Hallo!\n\nDu wurdest in das Team "${params.teamName}" eingeladen.\nRolle: ${params.role}\n\nAkzeptiere die Einladung:\n${params.inviteLink}\n\nWenn du kein Konto hast, melde dich mit dieser E-Mail an.`,
  });
}
