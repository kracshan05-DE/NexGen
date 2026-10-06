import type { IconName } from "@/components/Icon";

export type Industry = { icon: IconName; title: string; description: string };

export const industries: Industry[] = [
  {
    icon: "datacentre",
    title: "Data centres",
    description:
      "Particulate-controlled cleaning around live, mission-critical infrastructure.",
  },
  {
    icon: "lab",
    title: "Laboratories & controlled environments",
    description:
      "Validated protocols for pharmaceutical, medical and research facilities.",
  },
  {
    icon: "warehouse",
    title: "Warehouses & logistics facilities",
    description:
      "High-traffic floor care that fits around receiving and dispatch schedules.",
  },
  {
    icon: "office",
    title: "Offices & commercial buildings",
    description:
      "Routine and periodic servicing for tenanted and multi-storey buildings.",
  },
  {
    icon: "manufacturing",
    title: "Manufacturing facilities",
    description:
      "Industrial cleaning that meets site safety and housekeeping standards.",
  },
  {
    icon: "childcare",
    title: "Childcare centres & schools",
    description: "Hygiene-focused cleaning scheduled around occupied hours.",
  },
  {
    icon: "retail",
    title: "Retail & hospitality",
    description:
      "Front-of-house presentation and back-of-house compliance cleaning.",
  },
  {
    icon: "strata",
    title: "Body-corporate properties",
    description:
      "Common-area care across residential and mixed-use strata schemes.",
  },
];
