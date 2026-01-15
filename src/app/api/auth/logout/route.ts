import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { revokeSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  await revokeSession(token);

  const response = NextResponse.redirect(new URL("/auth/login", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
