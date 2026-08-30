import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/data/siteContent";
import { legalConfig, legalPlaceholders } from "@/data/legalContent";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterinformationen von ${brand.name}.`,
};

export default function ImpressumPage() {
  return (
    <>
      <Header alwaysVisible />
      <LegalPage
        eyebrow="Rechtliches"
        title="Impressum"
        intro={`Anbieterinformationen für die Website ${brand.name}.`}
        warning="Dieses Impressum enthält noch Platzhalter und muss vor der Veröffentlichung mit den echten Angaben des Betreibers vervollständigt und rechtlich geprüft werden."
        sections={[
          {
            title: "Angaben gemäß § 5 DDG",
            children: (
              <>
                <p>{legalPlaceholders.operatorName}</p>
                <p>{legalPlaceholders.street}</p>
                <p>{legalPlaceholders.city}</p>
                <p className="text-sm text-muted">
                  Ladungsfähige Anschrift erforderlich – kein Postfach.
                </p>
              </>
            ),
          },
          {
            title: "Kontakt",
            children: (
              <>
                <p>Telefon: {legalPlaceholders.phone}</p>
                <p>E-Mail: {brand.email}</p>
              </>
            ),
          },
          {
            title: "Steuerliche Angaben",
            children: <p>{legalConfig.taxStatus}</p>,
          },
          {
            title: "Verantwortlich für den Inhalt",
            children: (
              <p>
                {legalPlaceholders.operatorName}, {legalPlaceholders.street},{" "}
                {legalPlaceholders.city}
              </p>
            ),
          },
        ]}
      />
      <Footer />
    </>
  );
}
