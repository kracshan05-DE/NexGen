import type { NavItem } from "@/components/Header";
import { resolvedTeam } from "@/lib/flags";

/** Primary navigation. A link appears only if its section is on the page. */
export const navItems: NavItem[] = [
  { href: "/#services", label: "Services" },
  { href: "/#industries", label: "Industries" },
  ...(resolvedTeam.items.length > 0 ? [{ href: "/#team", label: "Team" }] : []),
  { href: "/#process", label: "How we work" },
  { href: "/#faq", label: "FAQ" },
];
