import type { IconName } from "@/components/Icon";

export const whyUs: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "clipboard",
    title: "Documented compliance",
    description:
      "Every job is scoped in writing and aligned to WHS and, where relevant, ISO 14644 protocols.",
  },
  {
    icon: "dollar",
    title: "Fixed-fee quoting",
    description:
      "No surprise call-out fees. You approve the scope and the price before a single crew steps on-site.",
  },
  {
    icon: "person",
    title: "One point of contact",
    description:
      "A single account manager across every site and every service line — no chasing subcontractors.",
  },
  {
    icon: "clock",
    title: "24/7 responsiveness",
    description:
      "Emergency call-outs and after-hours access windows, covered every day of the week.",
  },
  {
    icon: "report",
    title: "Verified reporting",
    description:
      "Job sheets, photos and — where required — air-particle test results after every single visit.",
  },
  {
    icon: "shield",
    title: "Vetted, insured crews",
    description:
      "Police-checked, inducted, and covered by full public liability and WHS insurance on every contract.",
  },
];

export const processStages: { title: string; description: string }[] = [
  {
    title: "Site assessment",
    description:
      "We walk the facility, review access constraints, flooring types and any classification requirements before quoting.",
  },
  {
    title: "Scope & compliance plan",
    description:
      "A written scope of work is issued, covering methods, chemicals, frequency and the standards we'll work to.",
  },
  {
    title: "Scheduled delivery",
    description:
      "Crews work to agreed access windows — after-hours, weekends or live-environment shifts — with minimal disruption.",
  },
  {
    title: "Reporting & verification",
    description:
      "Job sheets, photos and — where relevant — air-particle test results are provided after every visit.",
  },
];
