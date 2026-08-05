import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  setAdminSessionCookie,
  timingSafeEqual,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost = contentType.includes("application/x-www-form-urlencoded");
  const body = isFormPost
    ? Object.fromEntries((await request.formData()).entries())
    : ((await request.json().catch(() => null)) as
        | { username?: string; password?: string; next?: string }
        | null);

  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !passwordHash || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      {
        message:
          "Admin-Login ist noch nicht konfiguriert. Bitte ADMIN_USERNAME, ADMIN_PASSWORD_HASH und ADMIN_SESSION_SECRET setzen.",
      },
      { status: 500 },
    );
  }

  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  const nextPath = String(body?.next ?? "/admin");
  const safeNextPath = nextPath.startsWith("/admin") ? nextPath : "/admin";

  if (!username || !password) {
    if (isFormPost) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=missing`, request.url),
      );
    }
    return NextResponse.json(
      { message: "Benutzername und Passwort sind erforderlich." },
      { status: 400 },
    );
  }

  const usernameMatches = timingSafeEqual(username, expectedUsername);
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!usernameMatches || !passwordMatches) {
    if (isFormPost) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=invalid`, request.url),
      );
    }
    return NextResponse.json(
      { message: "Benutzername oder Passwort ist falsch." },
      { status: 401 },
    );
  }

  const token = await createAdminSessionToken(username);
  if (!token) {
    return NextResponse.json(
      { message: "Session konnte nicht erstellt werden." },
      { status: 500 },
    );
  }

  const response = isFormPost
    ? NextResponse.redirect(new URL(safeNextPath, request.url))
    : NextResponse.json({ ok: true });
  setAdminSessionCookie(response, token);
  return response;
}
