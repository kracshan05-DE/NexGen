import { createDatabaseSink } from "./database";
import { createEmailSink } from "./email";
import type { Lead, LeadSink, SinkName } from "./types";

type Env = Record<string, string | undefined>;

/**
 * Builds the list of destinations from environment variables. A sink exists
 * only when every variable it needs is present, so a half-configured service
 * is treated as "off" rather than failing on every request.
 */
export function configuredSinks(env: Env = process.env): LeadSink[] {
  const sinks: LeadSink[] = [];

  if (env.RESEND_API_KEY && env.ENQUIRY_FROM_EMAIL && env.ENQUIRY_TO_EMAIL) {
    sinks.push(
      createEmailSink({
        apiKey: env.RESEND_API_KEY,
        from: env.ENQUIRY_FROM_EMAIL,
        to: env.ENQUIRY_TO_EMAIL,
      }),
    );
  }

  if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
    sinks.push(
      createDatabaseSink({
        url: env.SUPABASE_URL,
        secretKey: env.SUPABASE_SECRET_KEY,
      }),
    );
  }

  return sinks;
}

export type DeliveryResult = {
  ok: boolean;
  delivered: SinkName[];
  failed: { sink: SinkName; reason: string }[];
};

/**
 * Sends a lead to every configured destination at the same time.
 *
 * The rule: the visitor sees "sent" only if at least one destination accepted
 * the lead. Email and database are independent, so one being down does not
 * lose the enquiry; both being down is reported honestly so the visitor can
 * phone instead.
 */
export async function deliverLead(
  lead: Lead,
  sinks: LeadSink[] = configuredSinks(),
  options: { allowConsoleFallback?: boolean } = {},
): Promise<DeliveryResult> {
  const allowConsoleFallback =
    options.allowConsoleFallback ?? process.env.NODE_ENV !== "production";

  if (sinks.length === 0) {
    if (allowConsoleFallback) {
      console.info("[enquiry] No delivery configured; lead logged only.", lead);
      return { ok: true, delivered: ["console"], failed: [] };
    }
    console.error(
      `[enquiry] ${lead.reference} NOT delivered: no email or database configured. Set the variables in .env.example.`,
    );
    return {
      ok: false,
      delivered: [],
      failed: [{ sink: "console", reason: "no delivery configured" }],
    };
  }

  const settled = await Promise.allSettled(sinks.map((sink) => sink.send(lead)));

  const result: DeliveryResult = { ok: false, delivered: [], failed: [] };
  settled.forEach((outcome, index) => {
    const sink = sinks[index].name;
    if (outcome.status === "fulfilled") {
      result.delivered.push(sink);
    } else {
      const reason =
        outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      result.failed.push({ sink, reason });
      console.error(`[enquiry] ${lead.reference} ${sink} failed: ${reason}`);
    }
  });

  result.ok = result.delivered.length > 0;
  return result;
}
