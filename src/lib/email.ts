import "server-only";

import { Resend } from "resend";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY fehlt, E-Mail-Versand wird uebersprungen.");
    return { ok: false, skipped: true, error: "RESEND_API_KEY fehlt" };
  }

  const fromName = process.env.EMAIL_FROM_NAME;
  const fromEmail = process.env.EMAIL_FROM;
  if (!fromName || !fromEmail) {
    console.warn(
      "EMAIL_FROM_NAME oder EMAIL_FROM fehlt, E-Mail-Versand wird uebersprungen.",
    );
    return {
      ok: false,
      skipped: true,
      error: "EMAIL_FROM_NAME oder EMAIL_FROM fehlt",
    };
  }

  const resend = new Resend(apiKey);
  const from = `${fromName} <${fromEmail}>`;

  try {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    } as any);
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return { ok: true };
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}
