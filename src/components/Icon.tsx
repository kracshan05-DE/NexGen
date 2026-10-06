import type { ReactNode, SVGProps } from "react";

/*
 * One small inline-SVG icon set (24×24, stroke based), taken from the original
 * design. Inline SVG means no icon font and no extra network request, and the
 * icons inherit colour from CSS via `currentColor`.
 */
const dot = { fill: "currentColor", stroke: "none" } as const;

const paths = {
  // contact / UI
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8.1 9.6a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4.5a2 2 0 0 1 4 0V17M11 12.5v4.5" />
    </>
  ),
  facebook: (
    <path d="M15 8h2V5h-2a4 4 0 0 0-4 4v2H9v3h2v7h3v-7h2.5l.5-3H14v-1.5A1 1 0 0 1 15 8Z" />
  ),

  // industries
  datacentre: (
    <>
      <rect x="4" y="3" width="16" height="7" rx="1" />
      <rect x="4" y="14" width="16" height="7" rx="1" />
      <circle cx="7.5" cy="6.5" r=".9" {...dot} />
      <circle cx="7.5" cy="17.5" r=".9" {...dot} />
    </>
  ),
  lab: (
    <>
      <path d="M9 2h6M10 2v6l-5 10a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V2" />
      <path d="M7.5 14h9" />
    </>
  ),
  warehouse: (
    <>
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M3 21h18M8 21v-7h3v7M13 21v-7h3v7" />
    </>
  ),
  office: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
    </>
  ),
  manufacturing: <path d="M3 21V11l5 3v-3l5 3V8l6 4v9Z" />,
  childcare: (
    <>
      <rect x="4" y="9" width="16" height="12" rx="1" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  retail: (
    <>
      <path d="M6 8h12l1 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  strata: (
    <>
      <path d="M4 21V4h9v17M13 21V9h7v12" />
      <path d="M7 8h1M7 12h1M7 16h1" />
    </>
  ),

  // why choose us
  clipboard: (
    <>
      <path d="M9 12.5 11 15l4-5" />
      <rect x="4" y="3" width="16" height="18" rx="1" />
    </>
  ),
  dollar: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  clock: (
    <>
      <path d="M12 8v4l3 3" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  report: <path d="M4 5h16M4 12h16M4 19h10" />,
  shield: <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Z" />,

  // placeholder partner glyphs (preview builds only)
  gem: (
    <>
      <path d="M12 2 2 9l10 13L22 9Z" />
      <path d="M2 9h20M8.5 9 12 2l3.5 7M9 9l3 13 3-13" />
    </>
  ),
  harbour: (
    <>
      <path d="M3 15c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
      <path d="M5 15V6l7-3 7 3v9" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V9l8-6 8 6v12" />
      <path d="M9 21v-7h6v7M9 12h.01M15 12h.01M9 8h.01M15 8h.01" />
    </>
  ),
  truck: (
    <>
      <rect x="2" y="9" width="13" height="7" rx="1" />
      <path d="M15 11h4l3 3v2h-7v-5Z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  peak: <path d="M3 20 9 8l4 7 3-5 5 10Z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

type Props = { name: IconName; strokeWidth?: number } & Omit<
  SVGProps<SVGSVGElement>,
  "name" | "children"
>;

/** Decorative by default (hidden from screen readers); the adjacent text carries the meaning. */
export function Icon({ name, strokeWidth = 1.5, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
