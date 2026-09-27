import { env } from "../lib/env.js";
import { getPlanPriceSummary } from "./chatbot.js";

const FALLBACK_REPLY =
  "I'm sorry, I'm having trouble looking that up right now. Please try calling back shortly, or reach our team through WhatsApp or the website.";

/**
 * Condensed knowledge for the voice agent only. The full site knowledge (~1650 tokens, used by the
 * Gemini chat widget) is too costly to resend every turn here: this flow runs through Langflow's Groq
 * node, and this account's Groq tier caps at 8000 tokens/minute shared across the whole conversation,
 * so a large per-turn prompt starts hitting that ceiling after just a few exchanges. Pricing stays
 * dynamic (queried fresh); everything else is a fixed, terser summary of the same facts.
 */
const VOICE_KNOWLEDGE = `MaidHire offers six services: Full-Time Maid, Part-Time Maid, Live-in Maid, Cook/Chef, Elderly Care, and Baby & Child Care.
Hiring takes 4 steps: share your requirements, get matched with verified candidates (usually within 3-5 working days), meet and choose, then start with ongoing support.
Every candidate passes a 4-stage screening: identity and document verification, reference checks with past employers, a government-approved medical fitness test, and police clearance.
MaidHire places staff in Dubai, Abu Dhabi, Sharjah, Riyadh, Jeddah and Dammam, with other cities arranged on request.
Every plan includes a replacement guarantee window (30-90 days depending on plan) if a placement doesn't work out.
Contact: +971 50 123 4567 (UAE) or +966 50 123 4567 (KSA), hello@maidhire.com, or WhatsApp via the button on the website.`;

/** Strips markdown a model might emit despite instructions not to — Twilio's <Say> would otherwise read "asterisk" and "hyphen" aloud. */
function toSpokenText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface LangflowRunResponse {
  outputs?: { outputs?: { artifacts?: { message?: string } }[] }[];
}

/**
 * Answers one turn of a conversation with the "MaidHire Voice Receptionist" Langflow flow
 * (ChatInput -> Memory -> Prompt -> Groq -> ChatOutput). Shared by the phone channel (routes/voice.ts,
 * sessionId = Twilio CallSid) and the website chat widget (routes/receptionist.ts, sessionId = a
 * per-page-load id) — Langflow keeps conversation history itself, keyed by sessionId, so we don't
 * track turns on our side either way.
 */
export async function answerReceptionistTurn(message: string, sessionId: string): Promise<string> {
  if (!env.LANGFLOW_API_KEY || !env.LANGFLOW_FLOW_ID) return FALLBACK_REPLY;

  try {
    const pricing = await getPlanPriceSummary().catch(() => "");
    const knowledge = pricing ? `${VOICE_KNOWLEDGE}\nPricing: ${pricing}` : VOICE_KNOWLEDGE;
    const res = await fetch(`${env.LANGFLOW_API_URL}/api/v1/run/${env.LANGFLOW_FLOW_ID}?stream=false`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.LANGFLOW_API_KEY },
      // Langflow runs as a single local process and queues concurrent requests rather than
      // running them in parallel, so this needs headroom beyond a single request's ~1-2s latency
      // for whenever more than one call/test hits it at once. Stays under Vapi's 20s request timeout.
      signal: AbortSignal.timeout(16_000),
      body: JSON.stringify({
        input_value: `Knowledge:\n${knowledge}\n\nCaller message: ${message}`,
        session_id: sessionId,
        output_type: "chat",
        input_type: "chat",
      }),
    });
    if (!res.ok) throw new Error(`Langflow run failed: ${res.status} ${await res.text()}`);

    const data = (await res.json()) as LangflowRunResponse;
    const text = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message?.trim();
    if (!text) {
      // Langflow returned 200 with no usable output — usually the flow's graph is disconnected (a broken/missing edge), not a network or auth failure.
      console.error("Voice agent (Langflow) returned an empty response — check the flow's edges in Langflow.", JSON.stringify(data));
      return FALLBACK_REPLY;
    }
    return toSpokenText(text);
  } catch (err) {
    console.error("Voice agent (Langflow) generation failed:", err);
    return FALLBACK_REPLY;
  }
}
