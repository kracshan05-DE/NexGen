"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Estimate } from "@/lib/estimator";

/*
 * The estimator and the enquiry form sit in different sections of the page.
 * This context is the small piece of shared state between them: when a visitor
 * calculates an estimate and asks for a confirmed quote, the form picks it up.
 */
type Value = {
  estimate: Estimate | null;
  setEstimate: (estimate: Estimate | null) => void;
};

const EstimateContext = createContext<Value | null>(null);

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const value = useMemo(() => ({ estimate, setEstimate }), [estimate]);
  return <EstimateContext value={value}>{children}</EstimateContext>;
}

export function useEstimate(): Value {
  const value = useContext(EstimateContext);
  if (!value) throw new Error("useEstimate must be used inside <EstimateProvider>");
  return value;
}
