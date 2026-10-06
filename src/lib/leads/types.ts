import type { EnquiryInput } from "@/lib/enquiry";
import type { Estimate } from "@/lib/estimator";

export type Lead = EnquiryInput & {
  /** Short reference shown to the visitor and used in the email subject. */
  reference: string;
  /** ISO 8601 timestamp, UTC. */
  receivedAt: string;
  /** Present when the visitor used the estimator first. Recomputed on the server. */
  estimate: Estimate | null;
};

export type SinkName = "email" | "database" | "console";

/** A destination for leads. Throws on failure; resolves on success. */
export type LeadSink = {
  name: SinkName;
  send: (lead: Lead) => Promise<void>;
};
