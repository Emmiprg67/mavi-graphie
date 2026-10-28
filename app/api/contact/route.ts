import { checkBotId } from "botid/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { brand } from "@/data/siteContent";

export const runtime = "nodejs";

const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "shootingType",
  "location",
  "message",
] as const;

const fieldLabels: Record<string, string> = {
  firstName: "Vorname",
  lastName: "Nachname",
  email: "E-Mail",
  phone: "Telefon",
  shootingType: "Art des Shootings",
  preferredDate: "Wunschtermin",
  location: "Ort / Location",
  people: "Anzahl der Personen",
  message: "Nachricht",
};

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function buildEmailText(
  body: Record<string, string | boolean | number | undefined>,
) {
  return Object.entries(fieldLabels)
    .map(([key, label]) => `${label}: ${String(body[key] ?? "").trim() || "-"}`)
    .join("\n");
}

const SUCCESS_MESSAGE = "Danke für deine Nachricht. Deine Anfrage wurde versendet.";

// Minimum time (ms) a human needs to fill the form; faster submissions are bot-like.
const MIN_FILL_TIME_MS = 3000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_LINKS_IN_MESSAGE = 2;

// In-memory sliding-window rate limit, keyed by IP.
// Note: this resets on cold start and is per function instance, so it is not a
// hard global guarantee on serverless - good enough to blunt casual bot floods.
// For a stronger guarantee across instances, use Upstash Redis (Vercel Marketplace)
// or Cloudflare Turnstile/Firewall rate limiting instead.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (submissionsByIp.size > 10_000) {
    // Safety valve against unbounded growth; not expected on this site's traffic.
    submissionsByIp.clear();
  }
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function countLinks(message: string): number {
  return (message.match(/https?:\/\/|www\./gi) ?? []).length;
}

export async function POST(request: NextRequest) {
  // Vercel BotID: invisible, JS-based bot detection with no external account
  // or keys needed. Blocks confirmed bots before any other work happens.
  const botVerification = await checkBotId();
  if (botVerification.isBot) {
    return NextResponse.json(
      { error: "Zugriff verweigert." },
      { status: 403 },
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        message:
          "Zu viele Anfragen von deiner Verbindung. Bitte versuche es in ein paar Minuten erneut.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, string | boolean | number | undefined>
    | null;

  if (!body) {
    return NextResponse.json(
      { message: "Die Anfrage konnte nicht gelesen werden." },
      { status: 400 },
    );
  }

  // Honeypot: real visitors never see or fill this field - only bots that
  // auto-fill every input do. Silently pretend success so bots don't adapt.
  if (String(body.website ?? "").trim() !== "") {
    console.warn("Contact form spam blocked (honeypot):", { ip });
    return NextResponse.json({ message: SUCCESS_MESSAGE });
  }

  // Time trap: the client records when the form loaded and sends it along.
  // Missing or implausibly fast submissions are treated as bots.
  const loadedAt = Number(body.loadedAt);
  if (!Number.isFinite(loadedAt) || Date.now() - loadedAt < MIN_FILL_TIME_MS) {
    console.warn("Contact form spam blocked (time trap):", { ip });
    return NextResponse.json({ message: SUCCESS_MESSAGE });
  }

  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        message: "Bitte fülle alle Pflichtfelder aus.",
        fields: missingFields,
      },
      { status: 400 },
    );
  }

  if (!isValidEmail(String(body.email))) {
    return NextResponse.json(
      { message: "Bitte gib eine gültige E-Mail-Adresse ein.", fields: ["email"] },
      { status: 400 },
    );
  }

  const message = String(body.message ?? "").trim();
  if (message.length < MIN_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        message:
          "Deine Nachricht ist zu kurz. Bitte beschreibe dein Anliegen etwas ausführlicher.",
        fields: ["message"],
      },
      { status: 400 },
    );
  }

  if (body.privacy !== true) {
    return NextResponse.json(
      {
        message:
          "Bitte bestätige die Datenschutzerklärung, bevor du die Anfrage sendest.",
        fields: ["privacy"],
      },
      { status: 400 },
    );
  }

  // Messages stuffed with links are a common spam pattern; discard quietly.
  if (countLinks(message) > MAX_LINKS_IN_MESSAGE) {
    console.warn("Contact form spam blocked (too many links):", { ip });
    return NextResponse.json({ message: SUCCESS_MESSAGE });
  }

  const senderDomain = process.env.RESEND_EMAIL_DOMAIN;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !senderDomain) {
    return NextResponse.json(
      {
        message:
          "Das Formular ist geprüft, aber noch nicht mit einem Versanddienst verbunden. Setze RESEND_API_KEY und RESEND_EMAIL_DOMAIN, um Anfragen zu versenden.",
        status: "not_configured",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const firstName = String(body.firstName);
  const lastName = String(body.lastName);
  const senderEmail = String(body.email);

  const { error } = await resend.emails.send({
    from: `${brand.name} Website <kontakt@${senderDomain}>`,
    to: [brand.email],
    replyTo: senderEmail,
    subject: `Neue Anfrage von ${firstName} ${lastName}`,
    text: buildEmailText(body),
  });

  if (error) {
    console.error("Resend send failed:", error);
    return NextResponse.json(
      {
        message:
          "Die Anfrage konnte gerade nicht versendet werden. Bitte versuche es später erneut.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: SUCCESS_MESSAGE });
}
