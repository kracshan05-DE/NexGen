import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { EstimateProvider } from "@/components/EstimateContext";
import { Estimator } from "@/components/Estimator";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Industries } from "@/components/Industries";
import { JsonLd } from "@/components/JsonLd";
import { OnSite } from "@/components/OnSite";
import { Partners } from "@/components/Partners";
import { PreviewBanner } from "@/components/PreviewBanner";
import { Process } from "@/components/Process";
import { Services } from "@/components/Services";
import { Team } from "@/components/Team";
import { Testimonials } from "@/components/Testimonials";
import { WhyUs } from "@/components/WhyUs";
import { navItems } from "@/lib/nav";

/*
 * The whole page is rendered to HTML at build time and served from the CDN.
 * Only three pieces ship JavaScript: the mobile menu, the estimator and the
 * enquiry form. Everything else is plain HTML and CSS.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Header items={navItems} />
      <main id="main" tabIndex={-1}>
        <div id="top" />
        <Hero />
        <Partners />
        <Testimonials />
        <About />
        {/* Shares the calculated estimate between the estimator and the form. */}
        <EstimateProvider>
          <Estimator />
          <Services />
          <OnSite />
          <Industries />
          <Team />
          <WhyUs />
          <Process />
          <Contact />
        </EstimateProvider>
        <Faq />
      </main>
      <Footer items={navItems} />
      <PreviewBanner />
    </>
  );
}
