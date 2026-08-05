"use client";

import Link from "next/link";
import { cloneElement, FormEvent, ReactElement, useId, useState } from "react";
import { shootingTypes } from "@/data/siteContent";

type FormErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "shootingType"
    | "location"
    | "message"
    | "privacy",
    string
  >
>;

type SubmitState =
  | { type: "idle"; message: "" }
  | { type: "success" | "error" | "setup"; message: string };

export function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<SubmitState>({ type: "idle", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const nextErrors: FormErrors = {};
    const payload = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      shootingType: String(form.get("shootingType") ?? ""),
      preferredDate: String(form.get("preferredDate") ?? ""),
      location: String(form.get("location") ?? "").trim(),
      budget: String(form.get("budget") ?? "").trim(),
      people: String(form.get("people") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
      privacy: form.get("privacy") === "on",
    };

    if (!payload.firstName) nextErrors.firstName = "Bitte gib deinen Vornamen ein.";
    if (!payload.lastName) nextErrors.lastName = "Bitte gib deinen Nachnamen ein.";
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
    }
    if (!payload.shootingType) {
      nextErrors.shootingType = "Bitte wähle eine Shooting-Art aus.";
    }
    if (!payload.location) {
      nextErrors.location = "Bitte gib einen Ort oder eine Location ein.";
    }
    if (!payload.message) {
      nextErrors.message = "Bitte schreibe eine kurze Nachricht.";
    }
    if (!payload.privacy) {
      nextErrors.privacy = "Bitte bestätige die Datenschutzerklärung.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    setState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        message?: string;
        status?: string;
      };

      if (response.ok) {
        setState({
          type: "success",
          message: data.message ?? "Danke, deine Nachricht wurde versendet.",
        });
        formElement.reset();
      } else if (data.status === "not_configured") {
        setState({
          type: "setup",
          message:
            data.message ??
            "Das Formular ist geprüft, aber noch nicht mit einem Versanddienst verbunden.",
        });
      } else {
        setState({
          type: "error",
          message:
            data.message ??
            "Die Anfrage konnte gerade nicht versendet werden. Bitte versuche es später erneut.",
        });
      }
    } catch {
      setState({
        type: "error",
        message:
          "Die Anfrage konnte gerade nicht verarbeitet werden. Bitte versuche es später erneut.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5">
      {state.message ? (
        <div
          role="status"
          className={`border p-4 text-base leading-7 ${
            state.type === "success"
              ? "border-sage bg-sage/10 text-graphite"
              : state.type === "setup"
                ? "border-gold bg-gold/10 text-graphite"
                : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Vorname *" error={errors.firstName}>
          <input name="firstName" autoComplete="given-name" />
        </Field>
        <Field label="Nachname *" error={errors.lastName}>
          <input name="lastName" autoComplete="family-name" />
        </Field>
      </div>

      <Field label="E-Mail-Adresse *" error={errors.email}>
        <input name="email" type="email" autoComplete="email" />
      </Field>

      <Field label="Telefonnummer">
        <input name="phone" type="tel" autoComplete="tel" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Art des Shootings *" error={errors.shootingType}>
          <select name="shootingType" defaultValue="">
            <option value="" disabled>
              Bitte auswählen
            </option>
            {shootingTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field label="Wunschtermin">
          <input name="preferredDate" type="date" />
        </Field>
      </div>

      <Field label="Ort oder Location *" error={errors.location}>
        <input name="location" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Budget">
          <input name="budget" inputMode="decimal" placeholder="Optional" />
        </Field>
        <Field label="Anzahl der Personen">
          <input name="people" inputMode="numeric" placeholder="Optional" />
        </Field>
      </div>

      <Field label="Nachricht *" error={errors.message}>
        <textarea name="message" rows={7} />
      </Field>

      <div className="flex gap-3 text-sm leading-6 text-stone-700">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-clay"
          aria-describedby={errors.privacy ? "privacy-error" : "privacy-help"}
          aria-invalid={Boolean(errors.privacy)}
        />
        <div>
          <p id="privacy-help">
            <span className="sr-only">Datenschutz-Zustimmung: </span>
          Ich habe die{" "}
          <Link href="/datenschutz" className="quiet-link font-semibold text-clay">
            Datenschutzerklärung
          </Link>{" "}
          gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung
          meiner Anfrage zu. *
          </p>
          {errors.privacy ? (
            <span id="privacy-error" className="mt-1 block font-semibold text-red-700">
              {errors.privacy}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="min-h-12 bg-graphite px-7 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Wird gesendet ..." : "Anfrage senden"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactElement<{
    id?: string;
    name?: string;
    className?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const generatedId = useId();
  const fieldId = children.props.id ?? `${children.props.name ?? "field"}-${generatedId}`;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="grid gap-2 text-sm font-semibold text-graphite">
      <label htmlFor={fieldId}>{label}</label>
      {cloneElement(children, {
        id: fieldId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId,
      })}
      {error ? (
        <span id={errorId} className="text-sm font-semibold text-red-700">
          {error}
        </span>
      ) : null}
    </div>
  );
}
