import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "shootingType",
  "location",
  "message",
] as const;

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
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

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "Das Formular ist geprüft, aber noch nicht mit einem Versanddienst verbunden. Setze CONTACT_WEBHOOK_URL, um Anfragen zu versenden.",
        status: "not_configured",
      },
      { status: 503 },
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CONTACT_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      ...body,
      receivedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
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
