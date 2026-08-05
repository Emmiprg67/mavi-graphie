import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/data/siteContent";
import { legalPlaceholders } from "@/data/legalContent";

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
            title: "Angaben zum Anbieter",
            children: (
              <>
                <p>{legalPlaceholders.operatorName}</p>
                <p>{brand.name}</p>
                <p>{legalPlaceholders.street}</p>
                <p>{legalPlaceholders.city}</p>
              </>
            ),
          },
          {
            title: "Kontakt",
            children: (
              <>
                <p>E-Mail: {legalPlaceholders.email}</p>
                <p>Telefon: {legalPlaceholders.phone}</p>
              </>
            ),
          },
          {
            title: "Vertretungsberechtigte Person",
            children: (
              <p>
                {legalPlaceholders.operatorName}{" "}
                <span className="text-muted">
                  - bitte nur ausfüllen, wenn diese Angabe für die Rechtsform
                  erforderlich ist.
                </span>
              </p>
            ),
          },
          {
            title: "Registereintrag",
            children: <p>{legalPlaceholders.register}</p>,
          },
          {
            title: "Umsatzsteuer- oder Wirtschafts-ID",
            children: <p>{legalPlaceholders.vatId}</p>,
          },
          {
            title: "Verantwortlich für redaktionelle Inhalte",
            children: (
              <>
                <p>{legalPlaceholders.operatorName}</p>
                <p>{legalPlaceholders.street}</p>
                <p>{legalPlaceholders.city}</p>
              </>
            ),
          },
          {
            title: "Haftungshinweise",
            children: (
              <p>
                Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die
                Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann
                jedoch keine Gewähr übernommen werden. Externe Links führen zu
                Angeboten Dritter, auf deren Inhalte kein Einfluss besteht.
              </p>
            ),
          },
        ]}
      />
      <Footer />
    </>
  );
}
