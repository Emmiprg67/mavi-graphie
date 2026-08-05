import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LegalPage } from "@/components/LegalPage";
import { legalConfig, legalPlaceholders } from "@/data/legalContent";
import { brand } from "@/data/siteContent";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: `Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten bei ${brand.name}.`,
};

export default function DatenschutzPage() {
  return (
    <>
      <Header alwaysVisible />
      <LegalPage
        eyebrow="Datenschutz"
        title="Datenschutzerklärung"
        intro={`Diese Hinweise beschreiben, welche Daten bei der Nutzung von ${brand.name} nach dem derzeitigen technischen Stand des Projekts verarbeitet werden können.`}
        warning="Diese Datenschutzerklärung enthält noch zu prüfende Angaben und muss vor der Veröffentlichung an die tatsächlich eingesetzten Dienste angepasst und rechtlich geprüft werden."
        sections={[
          {
            title: "Verantwortliche Stelle",
            children: (
              <>
                <p>{legalPlaceholders.operatorName}</p>
                <p>{legalPlaceholders.street}</p>
                <p>{legalPlaceholders.city}</p>
                <p>Kontakt-E-Mail: {legalPlaceholders.email}</p>
              </>
            ),
          },
          {
            title: "Allgemeine Hinweise zur Datenverarbeitung",
            children: (
              <p>
                Personenbezogene Daten werden verarbeitet, soweit dies für den
                Betrieb der Website, die Bearbeitung von Anfragen, die
                Verwaltung hochgeladener Bilder oder die technische Sicherheit
                erforderlich ist. Rechtsgrundlagen, Speicherfristen und
                Verantwortlichkeiten sind vor Veröffentlichung mit den echten
                Betreiberangaben zu prüfen.
              </p>
            ),
          },
          {
            title: "Hosting und Server-Logfiles",
            children: (
              <>
                <p>Hosting-Anbieter: {legalConfig.services.hosting}</p>
                <p>
                  Beim Aufruf der Website können technisch notwendige Logdaten
                  entstehen, etwa IP-Adresse, Datum und Uhrzeit des Zugriffs,
                  aufgerufene URL, Browserinformationen und Serverstatus. Die
                  konkrete Speicherdauer hängt vom eingesetzten Hosting ab:
                  {` ${legalPlaceholders.retention}`}.
                </p>
              </>
            ),
          },
          {
            title: "Kontaktaufnahme über das Formular",
            children: (
              <>
                <p>
                  Das Kontaktformular verarbeitet Vorname, Nachname,
                  E-Mail-Adresse, optionale Telefonnummer, Art des Shootings,
                  Wunschtermin, Ort oder Location, optionales Budget, optionale
                  Personenanzahl, Nachricht und die Datenschutz-Zustimmung.
                </p>
                <p>
                  Zweck ist die Bearbeitung der Anfrage. Serverseitig wird die
                  Datenschutz-Zustimmung geprüft. Ein Versand findet nur statt,
                  wenn ein Kontakt-Webhook über CONTACT_WEBHOOK_URL konfiguriert
                  ist. Zugangsdaten und Umgebungsvariablen werden nicht auf der
                  Website ausgegeben.
                </p>
              </>
            ),
          },
          {
            title: "Adminbereich, Upload und Bilderverwaltung",
            children: (
              <>
                <p>{legalConfig.services.admin}</p>
                <p>
                  Hochgeladene Bilder werden mit Kategorie, Alt-Text,
                  Startseiten-Markierung, Fotografenbild-Markierung und
                  Erstellungsdatum in der vorhandenen Medienverwaltung
                  gespeichert. Bildspeicher: {legalConfig.services.uploads}.
                </p>
              </>
            ),
          },
          {
            title: "Cookies und ähnliche Technologien",
            children: (
              <>
                <p>{legalConfig.services.cookies}</p>
                <p>
                  Nach aktueller Projektprüfung sind keine Analyse-, Marketing-
                  oder Social-Media-Embeds vorhanden, die ein
                  Einwilligungsbanner erfordern würden. Sollte später Tracking,
                  Statistik, eingebettete Inhalte oder nicht notwendige Cookies
                  ergänzt werden, muss eine echte Einwilligungslösung
                  eingerichtet werden.
                </p>
              </>
            ),
          },
          {
            title: "Externe Links zu Instagram",
            children: (
              <p>
                Die Website enthält einen normalen externen Link zum
                Instagram-Profil. Beim Anklicken verlässt du diese Website; für
                die Verarbeitung auf Instagram gelten die Datenschutzbedingungen
                des jeweiligen Anbieters. Es ist kein Instagram-Feed eingebettet.
              </p>
            ),
          },
          {
            title: "Analyse- und Statistikdienste",
            children: <p>{legalConfig.services.analytics}</p>,
          },
          {
            title: "Empfänger und Auftragsverarbeiter",
            children: (
              <p>
                Mögliche Empfänger sind der Hosting-Anbieter, technisch
                erforderliche Dienstleister und, falls eingerichtet, der
                Kontakt-Webhook-Anbieter. Diese Angaben müssen vor
                Veröffentlichung mit den tatsächlich eingesetzten Diensten
                abgeglichen werden.
              </p>
            ),
          },
          {
            title: "Rechte betroffener Personen",
            children: (
              <p>
                Betroffene Personen können je nach gesetzlicher Voraussetzung
                Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit sowie Widerspruch verlangen. Einwilligungen
                können mit Wirkung für die Zukunft widerrufen werden. Außerdem
                besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde:
                {` ${legalPlaceholders.supervisoryAuthority}`}.
              </p>
            ),
          },
          {
            title: "Aktualität",
            children: (
              <p>
                Diese Datenschutzerklärung bildet den aktuellen Projektstand ab
                und muss angepasst werden, sobald Hosting, Speicher, Versand,
                Analyse, Cookies oder externe Dienste geändert werden.
              </p>
            ),
          },
        ]}
      />
      <Footer />
    </>
  );
}
