import type { LeadSink } from "./types";

const TIMEOUT_MS = 8_000;

/**
 * Stores the lead in the Supabase `enquiries` table (see supabase/schema.sql).
 *
 * Uses the REST endpoint with the server-only secret key. The table has row
 * level security enabled with no policies, so the public (anon) key cannot
 * read or write it; only this server-side call can.
 */
export function createDatabaseSink(config: {
  url: string;
  secretKey: string;
}): LeadSink {
  const endpoint = `${config.url.replace(/\/+$/, "")}/rest/v1/enquiries`;
  return {
    name: "database",
    async send(lead) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: config.secretKey,
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          reference: lead.reference,
          received_at: lead.receivedAt,
          name: lead.name,
          company: lead.company || null,
          email: lead.email,
          phone: lead.phone,
          facility_type: lead.facilityType,
          location: lead.location || null,
          message: lead.message || null,
          estimate: lead.estimate,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Supabase responded ${response.status}`);
      }
    },
  };
}
