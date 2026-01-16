import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { consumeMagicLink, createSession, setSessionCookie } from "@/lib/auth";
import { ensureInitialTrainerForUser } from "@/lib/bootstrap";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?error=token", request.url));
  }

  const user = await consumeMagicLink(token);
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?error=token", request.url));
  }

  await ensureInitialTrainerForUser(user.id);

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  const target = user.passwordHash ? "/dashboard" : "/auth/set-password";
  return NextResponse.redirect(new URL(target, request.url));
}
