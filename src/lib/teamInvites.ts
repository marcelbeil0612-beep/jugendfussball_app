import "server-only";

import crypto from "node:crypto";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/db";

type InviteErrorCode =
  | "INVITE_NOT_FOUND"
  | "INVITE_USED"
  | "INVITE_EXPIRED"
  | "INVITE_EMAIL_MISMATCH"
  | "INVITE_USER_NOT_FOUND";

class InviteError extends Error {
  code: InviteErrorCode;

  constructor(code: InviteErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createToken = () => crypto.randomBytes(32).toString("base64url");

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

export async function createTeamInvite(params: {
  teamId: string;
  email: string;
  role: Role;
  expiresInDays?: number;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  const token = createToken();
  const expiresAt =
    typeof params.expiresInDays === "number"
      ? addDays(new Date(), params.expiresInDays)
      : undefined;

  const invite = await prisma.teamInvite.create({
    data: {
      teamId: params.teamId,
      email: normalizedEmail,
      role: params.role,
      token,
      expiresAt,
    },
  });

  return invite;
}

export async function acceptTeamInvite(params: {
  token: string;
  userId: string;
}) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const invite = await tx.teamInvite.findUnique({
      where: { token: params.token },
    });

    if (!invite) {
      throw new InviteError("INVITE_NOT_FOUND");
    }
    if (invite.usedAt) {
      throw new InviteError("INVITE_USED");
    }
    if (invite.expiresAt && invite.expiresAt < now) {
      throw new InviteError("INVITE_EXPIRED");
    }

    const user = await tx.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    });

    if (!user) {
      throw new InviteError("INVITE_USER_NOT_FOUND");
    }

    const inviteEmail = normalizeEmail(invite.email);
    const userEmail = normalizeEmail(user.email);

    if (inviteEmail !== userEmail) {
      throw new InviteError("INVITE_EMAIL_MISMATCH");
    }

    await tx.teamMember.upsert({
      where: { userId_teamId: { userId: params.userId, teamId: invite.teamId } },
      update: { role: invite.role },
      create: {
        userId: params.userId,
        teamId: invite.teamId,
        role: invite.role,
      },
    });

    await tx.user.update({
      where: { id: params.userId },
      data: { activeTeamId: invite.teamId },
    });

    await tx.teamInvite.update({
      where: { id: invite.id },
      data: { usedAt: now },
    });

    return { teamId: invite.teamId, role: invite.role };
  });
}
