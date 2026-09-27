import { GoogleGenAI } from "@google/genai";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";

const GEN_MODEL = "gemini-2.5-flash";
const EMBED_MODEL = "gemini-embedding-001";

interface Chunk {
  id: string;
  title: string;
  text: string;
}

interface EmbeddedChunk extends Chunk {
  vector: number[];
}

export interface ChatTurn {
  role: "user" | "bot";
  text: string;
}

/** Static site copy the chatbot is grounded in — mirrors the real marketing pages, not invented facts. */
const STATIC_CHUNKS: Chunk[] = [
  {
    id: "services-overview",
    title: "Services offered",
    text: "MaidHire offers six services: Full-Time Maid (daily housekeeping, laundry, ironing, household organisation), Part-Time Maid (hourly or day-based flexible schedules), Live-in Maid (round-the-clock household help with visa/sponsorship guidance), Cook/Chef (Arabic, Indian, Filipino and continental cuisine, menu planning, dietary needs), Elderly Care (nursing-assistant trained caregivers for mobility, medication reminders, companionship), and Baby & Child Care (nannies with early-years experience, first-aid certified, from infants to school-age).",
  },
  {
    id: "how-it-works",
    title: "How hiring works",
    text: "Hiring works in 4 steps: 1) Share Your Requirements — tell MaidHire what you need (full-time, live-in, cook, nanny or elderly care). 2) Get Matched — MaidHire shortlists verified candidates based on your preferences, usually within 3-5 working days. 3) Meet & Choose — interview candidates in person or online and select the right fit. 4) Start with Confidence — begin with documentation handled and ongoing support.",
  },
  {
    id: "verification",
    title: "What 'Verified' means",
    text: "Every candidate on MaidHire passes a four-stage screening before meeting a family: Identity & documents (passport, visa status and certificates verified against originals), Reference checks (calling previous employers to confirm duration, duties and conduct), Medical fitness (government-approved medical fitness testing arranged before placement), and Police clearance (home-country and Gulf police clearance certificates obtained and attested).",
  },
  {
    id: "faqs",
    title: "Frequently asked questions",
    text: [
      "Do you support visa and sponsorship paperwork? Yes. For live-in placements MaidHire guides families through the Tadbeer (UAE) or Musaned (KSA) process, medical fitness testing, police clearance and contract attestation.",
      "How long does matching take? Most families receive a curated shortlist within 3-5 working days. Immediate-availability candidates can start within a week of selection.",
      "What if the placement doesn't work out? Every plan includes a replacement window (30, 60 or 90 days depending on the plan) during which MaidHire finds a replacement at no extra cost.",
      "Are candidates interviewed before I meet them? Every candidate is screened: identity and document verification, reference calls, a skills interview and, for the Premium plan, an in-person assessment.",
      "Which cities do you cover? Dubai, Abu Dhabi, Sharjah, Riyadh, Jeddah and Dammam, with placements arranged across the wider UAE and Saudi Arabia on request.",
    ].join(" "),
  },
  {
    id: "values",
    title: "Company values",
    text: "MaidHire's values: Safety first (every placement built on verified identity, references, medical fitness and police clearance), Dignity for everyone (fair contracts, ethical recruitment, ongoing welfare check-ins for the people placed), Personal matching (a consultant curates a shortlist, not a database dump), and Transparent pricing (clear plans, government fees at cost, a written replacement guarantee).",
  },
  {
    id: "candidates-apply",
    title: "Applying as a candidate",
    text: "Domestic staff (maids, nannies, cooks, caregivers) can apply directly on the 'Join as a Candidate' page. Applying also creates their MaidHire account (with a password they set), so they can log back in afterwards and track their application status on the My Application page. An admin manually reviews applications and moves them through a pipeline: Applied, Screening, Interview, Verified, Available, Hired. Once a candidate is Verified or Available, their profile becomes visible on the public Browse Candidates page.",
  },
  {
    id: "accounts",
    title: "Account types",
    text: "MaidHire has three kinds of accounts, all reachable from the Log In page with a role switcher: Family accounts (for employers, to submit and track hire requests), Candidate accounts (created automatically when applying, for domestic staff to track their application status), and Admin accounts (staff who review candidates and manage the platform). Guests can also submit a hire request or contact message without any account at all.",
  },
  {
    id: "contact",
    title: "Contact details",
    text: "MaidHire can be reached at +971 50 123 4567 (UAE) or +966 50 123 4567 (KSA), Saturday to Thursday 9:00 AM - 7:00 PM, or by email at hello@maidhire.com (responds within 24 hours). Offices are in Business Bay, Dubai, UAE and Al Olaya, Riyadh, KSA. WhatsApp is also available via the chat button on the site.",
  },
];

let knowledgeBase: EmbeddedChunk[] | null = null;
let knowledgeBasePromise: Promise<EmbeddedChunk[]> | null = null;
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY) return null;
  if (!client) client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return client;
}

async function embedTexts(ai: GoogleGenAI, texts: string[]): Promise<number[][]> {
  const res = await ai.models.embedContent({ model: EMBED_MODEL, contents: texts });
  return (res.embeddings ?? []).map((e) => e.values ?? []);
}

async function buildPlanChunks(): Promise<Chunk[]> {
  const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return plans.map((p) => ({
    id: `plan-${p.slug}`,
    title: `${p.name} plan`,
    text: `${p.name} plan (${p.tagline}): AED ${p.priceAed} in the UAE or SAR ${p.priceSar} in Saudi Arabia, plus a one-time service fee. Includes: ${p.features.join(", ")}.${p.footnote ? ` Note: ${p.footnote}.` : ""}`,
  }));
}

/** Full knowledge base as plain text, for callers that inline it into a prompt instead of doing vector retrieval (e.g. the voice agent). */
export async function getKnowledgeText(): Promise<string> {
  const planChunks = await buildPlanChunks().catch(() => []);
  return [...STATIC_CHUNKS, ...planChunks].map((c) => `### ${c.title}\n${c.text}`).join("\n\n");
}

/** One line per plan (name + price only). Used by the voice agent, which is on a tight per-request token budget (Groq rate limits) and doesn't need the full feature lists. */
export async function getPlanPriceSummary(): Promise<string> {
  const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return plans.map((p) => `${p.name}: AED ${p.priceAed} (UAE) / SAR ${p.priceSar} (KSA)`).join("; ");
}

async function getKnowledgeBase(): Promise<EmbeddedChunk[] | null> {
  if (knowledgeBase) return knowledgeBase;
  const ai = getClient();
  if (!ai) return null;
  if (!knowledgeBasePromise) {
    knowledgeBasePromise = (async () => {
      const planChunks = await buildPlanChunks().catch(() => []);
      const chunks = [...STATIC_CHUNKS, ...planChunks];
      const vectors = await embedTexts(ai, chunks.map((c) => `${c.title}\n${c.text}`));
      const embedded = chunks.map((c, i) => ({ ...c, vector: vectors[i] ?? [] }));
      knowledgeBase = embedded;
      return embedded;
    })();
  }
  return knowledgeBasePromise;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function retrieveRelevant(ai: GoogleGenAI, query: string, k = 4): Promise<Chunk[]> {
  const kb = await getKnowledgeBase();
  if (!kb || kb.length === 0) return [];
  const [queryVector] = await embedTexts(ai, [query]);
  return kb
    .map((c) => ({ chunk: c, score: cosineSimilarity(queryVector, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}

const SYSTEM_PROMPT = `You are the MaidHire support assistant, embedded as a chat widget on the MaidHire website (a domestic staff recruitment platform for the UAE and Saudi Arabia).
Answer ONLY using the "Context" provided below plus the conversation history. Be concise, warm and helpful — 2-4 sentences unless a list is clearer.
If the answer isn't in the context, say you don't have that information and suggest contacting the team via WhatsApp or the Contact page — do not invent facts, prices, or policies.
Never ask for or discuss payment card details, passwords, or other sensitive personal data.`;

const FALLBACK_REPLY =
  "I'm getting a lot of questions right now and can't look that up this second. In the meantime, you can reach our team directly on WhatsApp (the green button in the corner) or via the Contact page, and we'll help right away.";

function retryable(status: unknown): boolean {
  const code = typeof status === "number" ? status : Number(status);
  return code === 429 || code === 503;
}

async function generateWithRetry(ai: GoogleGenAI, contents: string, retries = 1): Promise<string> {
  try {
    const res = await ai.models.generateContent({ model: GEN_MODEL, contents });
    return res.text ?? FALLBACK_REPLY;
  } catch (err) {
    const status = (err as { status?: number; code?: number })?.status ?? (err as { code?: number })?.code;
    if (retries > 0 && retryable(status)) {
      await new Promise((r) => setTimeout(r, 600));
      return generateWithRetry(ai, contents, retries - 1);
    }
    throw err;
  }
}

export async function answerQuestion(message: string, history: ChatTurn[]): Promise<{ reply: string; fallback: boolean }> {
  const ai = getClient();
  if (!ai) return { reply: FALLBACK_REPLY, fallback: true };

  try {
    const relevant = await retrieveRelevant(ai, message);
    const context = relevant.length ? relevant.map((c) => `### ${c.title}\n${c.text}`).join("\n\n") : "(no matching context found)";
    const historyText = history
      .slice(-6)
      .map((t) => `${t.role === "user" ? "Visitor" : "Assistant"}: ${t.text}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}\n\n## Context\n${context}\n\n## Conversation so far\n${historyText || "(start of conversation)"}\n\n## Visitor's new message\n${message}\n\n## Your reply`;

    const reply = await generateWithRetry(ai, prompt);
    return { reply, fallback: false };
  } catch (err) {
    console.error("Chatbot generation failed:", err);
    return { reply: FALLBACK_REPLY, fallback: true };
  }
}
