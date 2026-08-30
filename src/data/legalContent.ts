export const legalPlaceholders = {
  operatorName: "Vildan Gedik",
  city: "45772 Marl",
  phone: "015906164702",
  supervisoryAuthority: "[Zuständige Aufsichtsbehörde]",
  hostingProvider: "[Hosting-Anbieter]",
  storageProvider:
    "Cloudinary (Cloudinary Ltd., USA) für hochgeladene Bilddateien; Vercel Blob (Vercel Inc., USA) für den internen Bildindex (Metadaten)",
  retention: "[Speicherdauer der Server-Logdaten]",
};

export const legalConfig = {
  taxStatus: "Kleinunternehmer gemäß § 19 UStG – keine Umsatzsteuer-ID.",
  services: {
    hosting: legalPlaceholders.hostingProvider,
    uploads: legalPlaceholders.storageProvider,
    contactApi:
      "Kontaktformular über /api/contact; Versand per E-Mail über Resend (Resend Inc., USA) an das Postfach des Betreibers.",
    admin:
      "Admin-Uploadbereich zur Verwaltung der Fotografien, geschützt durch ein Login für den Betreiber.",
    instagram:
      "Externer Link zum Instagram-Profil. Es ist kein Instagram-Feed und kein Pixel eingebettet.",
    analytics:
      "Im Projekt wurden keine Analyse- oder Trackingdienste gefunden.",
    cookies:
      "Im Projekt wurden keine nicht notwendigen Cookies oder Tracking-Speicherungen gefunden.",
  },
};
