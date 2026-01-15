import "server-only";

import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const MAGIC_LINK_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 7;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createToken = () => crypto.randomBytes(32).toString("hex");

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

export async function requestMagicLink(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
    },
  });

  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = addMinutes(new Date(), MAGIC_LINK_TTL_MINUTES);

  await prisma.magicLinkToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const magicUrl = new URL("/auth/magic/verify", env.APP_URL);
  magicUrl.searchParams.set("token", token);

  const transporter = nodemailer.createTransport(env.AUTH_EMAIL_SERVER);
  await transporter.sendMail({
    from: env.AUTH_EMAIL_FROM,
    to: email,
    subject: "Dein Login-Link",
    text: `Hallo!\n\nHier ist dein Magic Link:\n${magicUrl.toString()}\n\nDer Link ist ${MAGIC_LINK_TTL_MINUTES} Minuten gueltig.`,
  });
}

export async function consumeMagicLink(token: string) {
  const tokenHash = hashToken(token);

  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.magicLinkToken.delete({ where: { id: record.id } });
    }
    return null;
  }

  await prisma.magicLinkToken.delete({ where: { id: record.id } });
  return record.user;
}

export async function createSession(userId: string) {
  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = addDays(new Date(), SESSION_TTL_DAYS);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getSessionUser() {
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const tokenHash = hashToken(sessionToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export function setSessionCookie(token: string, expiresAt: Date) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}
