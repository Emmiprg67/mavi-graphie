import type { Metadata } from "next";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { ContactForm } from "@/components/ContactForm";
import { ContactImageComposition } from "@/components/ContactImageComposition";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { brand, contactCopy } from "@/data/siteContent";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    `Kontaktformular für natürliche Familien-, Paar-, Hochzeits- und Portraitfotografie von ${brand.name}.`,
};

export default function ContactPage() {
  return (
    <>
      <Header alwaysVisible />
      <main className="bg-ivory pb-20 pt-28">
        <section className="section-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="order-2 bg-white p-5 md:p-8 lg:order-1">
            <ContactForm />
          </div>

          <div className="order-1 lg:order-2">
            <AnimatedHeading
              level={1}
              title={contactCopy.title}
              eyebrow="Kontakt"
              className="serif-heading text-[2.5rem] uppercase text-graphite md:text-[4rem]"
            />
            <div>
              <h2 className="mt-4 font-serif text-2xl text-clay">
                {contactCopy.subtitle}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-9 text-muted">
                {contactCopy.text}
              </p>
            </div>
            <div className="mt-10">
              <ContactImageComposition />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
