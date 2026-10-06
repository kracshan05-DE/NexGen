import { faqs } from "@/content/faqs";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Structured data: a machine-readable summary of the business that search
 * engines use to understand who Nexgen is and what it offers.
 *
 * Only verified facts go in here. Placeholder testimonials, partners and
 * team profiles are deliberately never included.
 */
export function JsonLd() {
  const url = getSiteUrl();
  const organisationId = `${url}/#organisation`;

  const graph = [
    {
      "@type": "Organization",
      "@id": organisationId,
      name: site.name,
      legalName: site.legalName,
      url,
      logo: `${url}/icon.png`,
      description: site.summary,
      email: site.email,
      telephone: site.phone.e164,
      areaServed: { "@type": "Country", name: "Australia" },
      ...(site.abn ? { taxID: site.abn.replace(/\s+/g, "") } : {}),
      ...(site.established ? { foundingDate: String(site.established) } : {}),
      sameAs: [site.social.linkedin, site.social.facebook].filter(Boolean),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: site.phone.e164,
        email: site.email,
        areaServed: "AU",
        availableLanguage: "English",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Facility cleaning and maintenance services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
            provider: { "@id": organisationId },
            areaServed: { "@type": "Country", name: "Australia" },
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      url,
      name: site.name,
      inLanguage: site.locale,
      publisher: { "@id": organisationId },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
    // Escape "<" so content can never close the script tag early.
    .replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
