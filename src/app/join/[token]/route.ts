import { NextResponse, type NextRequest } from "next/server";

import { createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { acceptTeamInvite } from "@/lib/teamInvites";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  if (!token || typeof token !== "string") {
    console.warn("JOIN_FAIL: missing token in route handler", { token });
    return NextResponse.redirect(new URL("/auth/login?invite=invalid", request.url));
  }

  console.log("JOIN_DEBUG: start join flow (route)", { token });

  try {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      select: {
        email: true,
        usedAt: true,
        expiresAt: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!invite) {
      console.warn("JOIN_FAIL: invite not found", { token });
      return NextResponse.redirect(new URL("/auth/login?invite=notfound", request.url));
    }

    if (invite.usedAt) {
      console.warn("JOIN_FAIL: invite already used", { token, usedAt: invite.usedAt });
      return NextResponse.redirect(new URL("/auth/login?invite=used", request.url));
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      console.warn("JOIN_FAIL: invite expired", { token, expiresAt: invite.expiresAt });
      return NextResponse.redirect(new URL("/auth/login?invite=expired", request.url));
    }

    const email = invite.email.trim().toLowerCase();
    const inviteFirstName = invite.firstName?.trim() || null;
    const inviteLastName = invite.lastName?.trim() || null;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName: inviteFirstName,
        lastName: inviteLastName,
      },
      select: { id: true, passwordHash: true, firstName: true, lastName: true },
    });
    const shouldUpdateName =
      (!!inviteFirstName && !user.firstName) || (!!inviteLastName && !user.lastName);
    if (shouldUpdateName) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName ?? inviteFirstName,
          lastName: user.lastName ?? inviteLastName,
        },
      });
    }
    console.log("JOIN_DEBUG: user upserted (route)", {
      userId: user.id,
      hasPassword: !!user.passwordHash,
    });

    await acceptTeamInvite({ token, userId: user.id });
    console.log("JOIN_DEBUG: acceptTeamInvite success (route)", {
      token,
      userId: user.id,
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);
    console.log("JOIN_DEBUG: session created & cookie set (route)", {
      userId: user.id,
    });

    if (!user.passwordHash) {
      return NextResponse.redirect(new URL("/auth/set-password", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.warn("JOIN_FAIL: route catch reached", {
      token,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(new URL("/auth/login?invite=error", request.url));
  }
}
