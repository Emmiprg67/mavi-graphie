import type { Metadata, Viewport } from "next";
import { brand } from "@/data/siteContent";
import { PageTransition } from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | Natürliche Familien- und Hochzeitsfotografie`,
    template: `%s | ${brand.name}`,
  },
  description:
    `Helle, natürliche und zeitlose Fotografie für Familien, Paare, Hochzeiten, Schwangerschaft, Neugeborene und Portraits von ${brand.name}.`,
  openGraph: {
    title: brand.name,
    description:
      `Ruhige, emotionale und hochwertige Fotografen-Website für natürliche Erinnerungen von ${brand.name}.`,
    type: "website",
    locale: "de_DE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#F8F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
