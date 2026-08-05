type LegalSection = {
  title: string;
  children: React.ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  warning: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  warning,
  sections,
}: LegalPageProps) {
  return (
    <main className="bg-ivory pb-20 pt-28 text-graphite md:pb-28">
      <article className="section-shell max-w-4xl">
        <div className="mb-10">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="serif-heading text-[2.65rem] uppercase md:text-[4.4rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
        </div>

        <p className="mb-12 border-l-4 border-gold bg-mist px-5 py-4 text-base leading-7 text-graphite">
          {warning}
        </p>

        <div className="grid gap-10">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-line pt-8">
              <h2 className="font-serif text-2xl text-graphite md:text-3xl">
                {section.title}
              </h2>
              <div className="prose-legal mt-5 text-base leading-8 text-muted">
                {section.children}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
