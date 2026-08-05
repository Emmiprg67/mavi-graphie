import { AnimatedHeading } from "./AnimatedHeading";

export function ContactSection() {
  return (
    <section
      id="kontakt"
      className="bg-mist py-20 text-graphite md:py-28"
      aria-labelledby="contact-cta-title"
    >
      <div className="section-shell text-center">
        <AnimatedHeading
          id="contact-cta-title"
          eyebrow="Kontakt"
          title="Lasst uns gemeinsam Erinnerungen festhalten."
          className="serif-heading mx-auto max-w-4xl text-[2.25rem] uppercase md:text-[3.4rem]"
        />
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-muted">
          Erzählt mir von euch, euren Vorstellungen und dem Shooting, das ihr
          euch wünscht. Auf der Kontaktseite findet ihr das vollständige
          Formular.
        </p>
        <a
          href="/kontakt"
          className="mt-9 inline-flex min-h-12 items-center bg-graphite px-7 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-clay"
        >
          Shooting anfragen
        </a>
      </div>
    </section>
  );
}
