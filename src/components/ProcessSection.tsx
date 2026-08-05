import { processSteps } from "@/data/siteContent";
import { AnimatedHeading } from "./AnimatedHeading";

export function ProcessSection() {
  return (
    <section
      className="bg-ivory py-20 md:py-28"
      aria-labelledby="process-title"
    >
      <div className="section-shell">
        <div className="mb-12 max-w-2xl">
          <AnimatedHeading
            id="process-title"
            eyebrow="Ablauf"
            title="Von der ersten Nachricht bis zu eurer fertigen Galerie."
            className="serif-heading text-[2.15rem] text-graphite md:text-[3.15rem]"
          />
        </div>

        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="h-full bg-white p-7 md:p-8">
              <p className="font-serif text-5xl text-greige">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-8 text-xl font-semibold text-graphite">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-muted">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
