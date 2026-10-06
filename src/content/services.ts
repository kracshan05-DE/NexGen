import type { StaticImageData } from "next/image";
import floorScrubbing from "@/assets/images/service-floor-scrubbing.jpg";
import carpet from "@/assets/images/service-carpet-steam-cleaning.jpg";
import pressure from "@/assets/images/service-pressure-washing.jpg";
import dataCentre from "@/assets/images/service-data-centre-cleaning.jpg";
import laboratory from "@/assets/images/service-laboratory-cleaning.jpg";
import airTesting from "@/assets/images/service-air-particle-testing.jpg";
import windows from "@/assets/images/service-window-cleaning.jpg";
import stripping from "@/assets/images/service-floor-stripping-sealing.jpg";
import highAccess from "@/assets/images/service-high-access-cleaning.jpg";
import mould from "@/assets/images/service-mould-remediation.jpg";
import warehouse from "@/assets/images/service-warehouse-cleaning.jpg";
import deepClean from "@/assets/images/service-commercial-deep-cleaning.jpg";

export type Service = {
  /** Stable URL-safe id. Ready for /services/[slug] pages when long-form copy exists. */
  slug: string;
  title: string;
  description: string;
  image: StaticImageData;
  /** Describes the photo for screen readers. */
  imageAlt: string;
  /** Short label used in the footer; omit to keep the service out of the footer list. */
  footerLabel?: string;
};

export const services: Service[] = [
  {
    slug: "machine-floor-scrubbing",
    title: "Machine floor scrubbing",
    description:
      "Ride-on and walk-behind scrubbing for large-format concrete, epoxy and vinyl floors.",
    image: floorScrubbing,
    imageAlt: "Cleaner operating a walk-behind floor scrubber in a sports hall",
  },
  {
    slug: "carpet-steam-cleaning",
    title: "Carpet steam cleaning",
    description:
      "Hot-water extraction that lifts embedded soil and allergens without saturating the underlay.",
    image: carpet,
    imageAlt: "Hot-water extraction wand cleaning a carpet",
  },
  {
    slug: "pressure-washing",
    title: "Pressure washing",
    description:
      "High-pressure and soft-wash treatments for facades, car parks, loading docks and walkways.",
    image: pressure,
    imageAlt: "Pressure washer cleaning stone paving",
  },
  {
    slug: "data-centre-cleaning",
    title: "Data-centre cleaning",
    description:
      "Anti-static, particulate-controlled cleaning under raised floors and around live racks.",
    image: dataCentre,
    imageAlt: "Technician in protective coveralls cleaning a data hall floor",
    footerLabel: "Data-centre cleaning",
  },
  {
    slug: "laboratory-cleanroom-cleaning",
    title: "Laboratory & ISO-controlled-environment cleaning",
    description:
      "Validated cleaning protocols for cleanrooms classified to ISO 14644 and equivalent standards.",
    image: laboratory,
    imageAlt: "Technician in a cleanroom suit wiping a laboratory floor",
    footerLabel: "Lab & cleanroom cleaning",
  },
  {
    slug: "air-particle-testing",
    title: "Air-particle testing",
    description:
      "Particle counts and viable air sampling to verify your environment meets its classification.",
    image: airTesting,
    imageAlt: "Technician taking an air reading at a ceiling vent",
    footerLabel: "Air-particle testing",
  },
  {
    slug: "window-cleaning",
    title: "Window cleaning",
    description:
      "Internal and external glass, from shopfronts to multi-storey curtain walls.",
    image: windows,
    imageAlt: "Cleaner washing large exterior windows with a squeegee",
  },
  {
    slug: "floor-stripping-sealing",
    title: "Floor stripping & sealing",
    description:
      "Strip, recoat and seal resilient flooring to restore finish, slip resistance and lifespan.",
    image: stripping,
    imageAlt: "Cleaner polishing a sealed lobby floor with a rotary machine",
  },
  {
    slug: "high-access-cleaning",
    title: "High-access cleaning",
    description:
      "Rope access and EWP cleaning for facades, atriums, signage and roof-mounted plant.",
    image: highAccess,
    imageAlt: "Cleaner using an extension pole to reach high glazing above a stairwell",
    footerLabel: "High-access cleaning",
  },
  {
    slug: "mould-remediation-subfloor-cleaning",
    title: "Mould remediation & subfloor cleaning",
    description:
      "Contain, remove and treat mould at the source, including crawl spaces and subfloor voids.",
    image: mould,
    imageAlt: "Technician in a respirator treating mould on a wall",
  },
  {
    slug: "warehouse-industrial-cleaning",
    title: "Warehouse & industrial cleaning",
    description:
      "Scheduled cleaning that works around racking, plant and forklift traffic without downtime.",
    image: warehouse,
    imageAlt: "Crew in high-visibility vests mopping a warehouse floor",
    footerLabel: "Warehouse cleaning",
  },
  {
    slug: "commercial-deep-cleaning",
    title: "Commercial deep cleaning",
    description:
      "Periodic deep cleans for offices, retail and hospitality fit-outs between routine services.",
    image: deepClean,
    imageAlt: "Team deep cleaning an open-plan office",
  },
];
