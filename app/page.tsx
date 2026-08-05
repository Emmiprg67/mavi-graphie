import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { EditorialImageDivider } from "@/components/EditorialImageDivider";
import { EditorialWeddingSection } from "@/components/EditorialWeddingSection";
import { Footer } from "@/components/Footer";
import { GallerySection } from "@/components/GallerySection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InfiniteImageSlider } from "@/components/InfiniteImageSlider";
import { IntroSection } from "@/components/IntroSection";
import { ProcessSection } from "@/components/ProcessSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <InfiniteImageSlider />
        <IntroSection />
        <EditorialWeddingSection />
        <ServicesSection />
        <AboutSection />
        <EditorialImageDivider />
        <GallerySection />
        <ProcessSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
