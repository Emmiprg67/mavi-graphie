import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "shootingType",
  "location",
  "message",
] as const;

const CONTACT_RECIPIENT = "mavi.graphie@gmx.de";

const fieldLabels: Record<string, string> = {
  firstName: "Vorname",
  lastName: "Nachname",
  email: "E-Mail",
  phone: "Telefon",
  shootingType: "Art des Shootings",
  preferredDate: "Wunschtermin",
  location: "Ort / Location",
  budget: "Budget",
  people: "Anzahl der Personen",
  message: "Nachricht",
};

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function buildEmailText(body: Record<string, string | boolean | undefined>) {
  return Object.entries(fieldLabels)
    .map(([key, label]) => `${label}: ${String(body[key] ?? "").trim() || "-"}`)
    .join("\n");
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | Record<string, string | boolean | undefined>
    | null;

  if (!body) {
    return NextResponse.json(
      { message: "Die Anfrage konnte nicht gelesen werden." },
      { status: 400 },
    );
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
    from: `Mavi Graphie Website <kontakt@${senderDomain}>`,
    to: [CONTACT_RECIPIENT],
    replyTo: senderEmail,
    subject: `Neue Anfrage von ${firstName} ${lastName}`,
    text: buildEmailText(body),
  });

  if (error) {
    return NextResponse.json(
      {
        message:
          "Die Anfrage konnte gerade nicht versendet werden. Bitte versuche es später erneut.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Danke für deine Nachricht. Deine Anfrage wurde versendet.",
  });
}
