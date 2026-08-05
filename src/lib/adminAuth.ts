import type { NextRequest, NextResponse } from "next/server";

export const adminSessionCookieName = "mavi_admin_session";
export const adminSessionMaxAge = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  exp: number;
  sid: string;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function toBase64Url(input: string | Uint8Array) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value: string) {
  const secret = getSessionSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toBase64Url(new Uint8Array(signature));
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export async function createAdminSessionToken(username: string) {
  const payload: SessionPayload = {
    sub: username,
    exp: Date.now() + adminSessionMaxAge * 1000,
    sid: crypto.randomUUID(),
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await sign(encodedPayload);
  if (!signature) return "";
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = await sign(encodedPayload);
  if (!expectedSignature || !timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    return Boolean(payload.sub && payload.exp > Date.now());
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(adminSessionCookieName)?.value,
  );
}

export function setAdminSessionCookie(
  response: NextResponse,
  token: string,
) {
  response.cookies.set(adminSessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSessionMaxAge,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(adminSessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
