/**
 * Indicative pricing model for the on-page estimator.
 *
 * Rates are AUD per square metre, per service visit, as a [low, high] band.
 * They were supplied by the client and are deliberately kept in one place:
 * the calculator UI and the enquiry handler both read from here, so a rate
 * change can never leave the two out of step.
 */
export const facilityTypes = [
  { value: "office", label: "Office & commercial", rate: [0.18, 0.24] },
  { value: "warehouse", label: "Warehouse & industrial", rate: [0.14, 0.19] },
  { value: "datacentre", label: "Data centre / cleanroom", rate: [0.35, 0.48] },
  { value: "retail", label: "Retail & hospitality", rate: [0.2, 0.27] },
  { value: "strata", label: "Body corporate / common areas", rate: [0.12, 0.16] },
] as const;

export const frequencies = [
  { value: "daily", label: "Daily", visitsPerMonth: 22, summary: "Daily (approx. 22 services / month)" },
  { value: "3x", label: "3 times per week", visitsPerMonth: 13, summary: "3 times a week (approx. 13 services / month)" },
  { value: "weekly", label: "Weekly", visitsPerMonth: 4.3, summary: "Weekly (approx. 4.3 services / month)" },
  { value: "fortnightly", label: "Fortnightly", visitsPerMonth: 2.2, summary: "Fortnightly (approx. 2.2 services / month)" },
] as const;

export type FacilityType = (typeof facilityTypes)[number]["value"];
export type Frequency = (typeof frequencies)[number]["value"];

export const facilityTypeValues = facilityTypes.map((t) => t.value) as [FacilityType, ...FacilityType[]];
export const frequencyValues = frequencies.map((f) => f.value) as [Frequency, ...Frequency[]];

/** Largest floor area the estimator accepts. Anything bigger needs a site visit, not a calculator. */
export const MAX_AREA_SQM = 500_000;

export type Estimate = {
  area: number;
  type: FacilityType;
  frequency: Frequency;
  perVisit: { low: number; high: number };
  monthly: { low: number; high: number };
};

export function isFacilityType(value: unknown): value is FacilityType {
  return facilityTypeValues.includes(value as FacilityType);
}

export function isFrequency(value: unknown): value is Frequency {
  return frequencyValues.includes(value as Frequency);
}

/** Returns null when the inputs cannot produce a meaningful estimate. */
export function calculateEstimate(input: {
  area: number;
  type: string;
  frequency: string;
}): Estimate | null {
  const { area, type, frequency } = input;
  if (!Number.isFinite(area) || area <= 0 || area > MAX_AREA_SQM) return null;
  if (!isFacilityType(type) || !isFrequency(frequency)) return null;

  const [lowRate, highRate] = facilityTypes.find((t) => t.value === type)!.rate;
  const visits = frequencies.find((f) => f.value === frequency)!.visitsPerMonth;

  const low = Math.round(area * lowRate);
  const high = Math.round(area * highRate);

  return {
    area,
    type,
    frequency,
    perVisit: { low, high },
    monthly: { low: Math.round(low * visits), high: Math.round(high * visits) },
  };
}

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function formatAud(amount: number): string {
  return aud.format(amount);
}

export function formatRange(range: { low: number; high: number }): string {
  return `${formatAud(range.low)} – ${formatAud(range.high)}`;
}

export function facilityLabel(type: string): string {
  return facilityTypes.find((t) => t.value === type)?.label ?? "Other";
}

export function frequencyLabel(frequency: string): string {
  return frequencies.find((f) => f.value === frequency)?.label ?? frequency;
}

/** One-line description of an estimate, used in the form and the lead email. */
export function describeEstimate(e: Estimate): string {
  return `${e.area.toLocaleString("en-AU")} sqm · ${facilityLabel(e.type)} · ${frequencyLabel(e.frequency)} · ${formatRange(e.perVisit)} per visit`;
}
