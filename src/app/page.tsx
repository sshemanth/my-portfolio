import { Header } from "@/components/Header";
import { Motion } from "@/components/Motion";
import { HeroSequence } from "@/components/hero/HeroSequence";
import { Contact, Education, Facts, Footer, Projects, Publications, ResearchPath, Technology, Themes } from "@/components/sections/Sections";
import { site } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  sameAs: site.profiles.map((p) => p.href),
};

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroSequence />
        <div id="content">
          <Facts />
          <ResearchPath />
          <Publications />
          <Projects />
          <Themes />
          <Technology />
          <Education />
          <Contact />
        </div>
      </main>
      <Footer />
      <Motion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
