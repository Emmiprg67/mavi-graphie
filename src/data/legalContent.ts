export const legalPlaceholders = {
  operatorName: "[VOLLSTÄNDIGEN NAMEN EINTRAGEN]",
  street: "[STRASSE UND HAUSNUMMER EINTRAGEN]",
  city: "[PLZ UND ORT EINTRAGEN]",
  email: "[E-MAIL-ADRESSE EINTRAGEN]",
  phone: "[TELEFONNUMMER EINTRAGEN]",
  vatId: "[UMSATZSTEUER-ID EINTRAGEN - FALLS VORHANDEN]",
  register: "[REGISTERANGABEN EINTRAGEN - FALLS VORHANDEN]",
  supervisoryAuthority: "[ZUSTÄNDIGE AUFSICHTSBEHÖRDE PRÜFEN]",
  hostingProvider: "[HOSTING-ANBIETER PRÜFEN UND EINTRAGEN]",
  storageProvider: "Lokaler Uploadspeicher im Projektordner public/uploads",
  retention: "[SPEICHERDAUER PRÜFEN]",
};

export const legalConfig = {
  services: {
    hosting: legalPlaceholders.hostingProvider,
    uploads: legalPlaceholders.storageProvider,
    contactApi:
      "Kontaktformular über /api/contact; optionaler Versand an CONTACT_WEBHOOK_URL, falls konfiguriert.",
    admin:
      "Admin-Uploadbereich mit optionalem ADMIN_UPLOAD_TOKEN. Der Token wird nicht öffentlich angezeigt.",
    instagram:
      "Externer Link zum Instagram-Profil. Es ist kein Instagram-Feed und kein Pixel eingebettet.",
    analytics:
      "Im Projekt wurden keine Analyse- oder Trackingdienste gefunden.",
    cookies:
      "Im Projekt wurden keine nicht notwendigen Cookies oder Tracking-Speicherungen gefunden.",
  },
};
