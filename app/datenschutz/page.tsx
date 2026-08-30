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
        sections={[
          {
            title: "1. Datenschutz auf einen Blick",
            children: (
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber,
                was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
                Website besuchen. Personenbezogene Daten sind alle Daten, mit
                denen Sie persönlich identifiziert werden können.
                Verantwortliche Stelle, Zwecke der Verarbeitung und Ihre Rechte
                sind in den folgenden Abschnitten dieser Erklärung
                zusammengefasst.
              </p>
            ),
          },
          {
            title: "2. Verantwortliche Stelle",
            children: (
              <>
                <p>
                  Verantwortliche Stelle für die Datenverarbeitung auf dieser
                  Website ist:
                </p>
                <p>{legalPlaceholders.operatorName}</p>
                <p>{legalPlaceholders.city}</p>
                <p>Telefon: {legalPlaceholders.phone}</p>
                <p>E-Mail: {brand.email}</p>
                <p>
                  Verantwortliche Stelle ist die natürliche oder juristische
                  Person, die allein oder gemeinsam mit anderen über die
                  Zwecke und Mittel der Verarbeitung von personenbezogenen
                  Daten entscheidet.
                </p>
              </>
            ),
          },
          {
            title: "3. Nutzung Ihrer Daten",
            children: (
              <>
                <p>
                  Beim Aufruf dieser Website können durch den Hosting-Anbieter
                  technisch notwendige Logdaten entstehen, etwa IP-Adresse,
                  Datum und Uhrzeit des Zugriffs, aufgerufene URL,
                  Browserinformationen und Serverstatus. Hosting-Anbieter:{" "}
                  {legalConfig.services.hosting}. Speicherdauer:{" "}
                  {legalPlaceholders.retention}.
                </p>
                <p>
                  {legalConfig.services.contactApi} Verarbeitet werden dabei
                  Vorname, Nachname, E-Mail-Adresse, optionale Telefonnummer,
                  Art des Shootings, Wunschtermin, Ort oder Location,
                  optionales Budget, optionale Personenanzahl, Nachricht und
                  die Datenschutz-Zustimmung. Zweck ist ausschließlich die
                  Bearbeitung Ihrer Anfrage.
                </p>
                <p>
                  {legalConfig.services.admin} Hochgeladene Fotografien werden
                  über {legalConfig.services.uploads} gespeichert und
                  ausgeliefert (siehe Abschnitt 7 „Externe Inhalte“).
                </p>
              </>
            ),
          },
          {
            title: "4. Besucherzähler",
            children: (
              <p>
                Diese Website setzt keinen Besucherzähler und keine Analyse-
                oder Statistik-Tools ein. {legalConfig.services.analytics}{" "}
                {legalConfig.services.cookies} Es werden keine
                Nutzungsprofile erstellt.
              </p>
            ),
          },
          {
            title: "5. Ihre Rechte",
            children: (
              <p>
                Sie können jederzeit unentgeltlich Auskunft über Herkunft,
                Empfänger und Zweck Ihrer gespeicherten personenbezogenen
                Daten verlangen sowie Berichtigung, Löschung oder
                Einschränkung der Verarbeitung dieser Daten fordern. Erteilte
                Einwilligungen können Sie jederzeit mit Wirkung für die
                Zukunft widerrufen. Außerdem steht Ihnen ein Recht auf
                Datenübertragbarkeit sowie ein Widerspruchsrecht gegen die
                Verarbeitung Ihrer Daten zu.
              </p>
            ),
          },
          {
            title: "6. SSL-/TLS-Verschlüsselung",
            children: (
              <p>
                Diese Website nutzt aus Sicherheitsgründen und zum Schutz der
                Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen
                über das Kontaktformular, eine SSL-/TLS-Verschlüsselung. Eine
                verschlüsselte Verbindung erkennen Sie daran, dass die
                Adresszeile des Browsers von „http://“ auf „https://“
                wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Ist
                die SSL- bzw. TLS-Verschlüsselung aktiviert, können die
                Daten, die Sie an diese Website übermitteln, nicht von
                Dritten mitgelesen werden.
              </p>
            ),
          },
          {
            title: "7. Externe Inhalte",
            children: (
              <>
                <p>
                  Fotografien auf dieser Website werden über den Cloud-Dienst
                  Cloudinary (Cloudinary Ltd., USA) ausgeliefert. Beim Aufruf
                  von Seiten mit eingebundenen Bildern wird eine Verbindung zu
                  Servern von Cloudinary hergestellt, wodurch technische
                  Daten wie Ihre IP-Adresse an Cloudinary übermittelt werden
                  können.
                </p>
                <p>{legalConfig.services.instagram}</p>
              </>
            ),
          },
          {
            title: "8. Beschwerderecht, Kontakt zum Datenschutz",
            children: (
              <p>
                Ihnen steht im Falle datenschutzrechtlicher Verstöße ein
                Beschwerderecht bei der zuständigen Aufsichtsbehörde zu:{" "}
                {legalPlaceholders.supervisoryAuthority}. Bei Fragen zum
                Datenschutz können Sie uns jederzeit unter der oben genannten
                Kontakt-E-Mail-Adresse ({brand.email}) erreichen.
              </p>
            ),
          },
        ]}
      />
      <Footer />
    </>
  );
}
