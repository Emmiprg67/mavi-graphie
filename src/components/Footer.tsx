import Link from "next/link";
import { brand, navigation } from "@/data/siteContent";
import { InstagramIcon } from "./InstagramIcon";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-mist py-12 text-graphite">
      <div className="section-shell">
        <div className="grid gap-10 border-b border-line pb-10 md:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Link href="/" className="brand-logo text-3xl">
              {brand.name}
            </Link>
            <p className="mt-4 max-w-sm text-base leading-7 text-muted">
              Helle, natürliche Fotografie für Familien, Paare, Hochzeiten und
              Portraits.
            </p>
          </div>

          <nav className="grid gap-3" aria-label="Footer Navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="quiet-link w-fit text-sm font-semibold uppercase tracking-normal"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="grid content-start gap-4 text-sm text-muted">
            <a
              className="inline-flex w-fit items-center gap-3 transition hover:text-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram-Profil von ${brand.name} öffnen`}
            >
              <InstagramIcon className="h-5 w-5" />
              Instagram
            </a>
            <a className="quiet-link w-fit" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
            <Link className="quiet-link w-fit" href="/kontakt">
              Kontakt
            </Link>
            <Link className="quiet-link w-fit" href="/impressum">
              Impressum
            </Link>
            <Link className="quiet-link w-fit" href="/datenschutz">
              Datenschutz
            </Link>
          </div>
        </div>

        <p className="pt-7 text-sm text-muted">
          © {year} {brand.name}. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
