export function IntroSection() {
  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby="intro-title">
      <div className="section-shell max-w-4xl text-center">
        <p className="eyebrow mb-6">Natürliche Fotografie</p>
        <h2
          id="intro-title"
          className="serif-heading text-[2.25rem] uppercase text-graphite md:text-[3.35rem]"
        >
          Jedes Shooting erzählt eure eigene Geschichte.
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-stone-600 md:text-xl">
          Natürliche Momente, echte Emotionen und Erinnerungen, die euch ein
          Leben lang begleiten. Gemeinsam schaffen wir Bilder, die sich nach euch
          anfühlen.
        </p>
      </div>
    </section>
  );
}
