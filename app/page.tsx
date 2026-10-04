import { Contact } from "@/components/sections/Contact";
import { ExperienceSection } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Human } from "@/components/sections/Human";
import { Lab } from "@/components/sections/Lab";
import { Manifesto } from "@/components/sections/Manifesto";
import { Story } from "@/components/sections/Story";
import { Systems } from "@/components/sections/Systems";
import { Work } from "@/components/sections/Work";

/**
 * One continuous descent: the object in the hero is the stack diagram in
 * Systems, the diagrams in Work are the systems themselves, and the object
 * returns — resolved — at Contact.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Story />
      <Work />
      <Systems />
      <ExperienceSection />
      <Lab />
      <Human />
      <Contact />
      <Footer />
    </>
  );
}
