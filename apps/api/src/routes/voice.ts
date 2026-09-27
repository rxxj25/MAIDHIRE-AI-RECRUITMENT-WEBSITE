import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import twilio from "twilio";
import { env } from "../lib/env.js";
import { answerReceptionistTurn } from "../services/voice.js";

const VoiceResponse = twilio.twiml.VoiceResponse;

const VOICE = "Polly.Joanna";
const GREETING = "Thank you for calling MaidHire. I'm your virtual assistant, how can I help you today?";
const NO_INPUT_REPLY = "Sorry, I didn't catch that. Could you say that again?";
const GOODBYE = "Thanks for calling MaidHire. Have a great day, goodbye.";

/** Confirms the request really came from Twilio. Skipped (with a console warning) if TWILIO_AUTH_TOKEN isn't set, so local dev works before that's configured. */
function hasValidSignature(req: FastifyRequest): boolean {
  if (!env.TWILIO_AUTH_TOKEN) {
    console.warn("TWILIO_AUTH_TOKEN not set — skipping voice webhook signature check (do not run production like this)");
    return true;
  }
  const signature = req.headers["x-twilio-signature"];
  if (typeof signature !== "string") return false;
  const url = `${env.API_PUBLIC_URL}${req.url}`;
  return twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, (req.body as Record<string, string>) ?? {});
}

function gatherAndSay(twiml: InstanceType<typeof VoiceResponse>, text: string) {
  const gather = twiml.gather({ input: ["speech"], action: "/api/voice/respond", method: "POST", speechTimeout: "auto", language: "en-US" });
  gather.say({ voice: VOICE }, text);
  twiml.say({ voice: VOICE }, GOODBYE);
  twiml.hangup();
}

const voiceRoutes: FastifyPluginAsync = async (app) => {
  /* ---- Twilio Voice webhooks: AI phone receptionist (Langflow flow "MaidHire Voice Receptionist", backed by Groq) ---- */
  app.post("/incoming", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } }, async (req, reply) => {
    if (!hasValidSignature(req)) return reply.status(403).send();
    const twiml = new VoiceResponse();
    gatherAndSay(twiml, GREETING);
    reply.header("Content-Type", "text/xml").send(twiml.toString());
  });

  app.post("/respond", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (req, reply) => {
    if (!hasValidSignature(req)) return reply.status(403).send();
    const body = req.body as { CallSid?: string; SpeechResult?: string };
    const speech = body.SpeechResult?.trim();

    const twiml = new VoiceResponse();
    if (!speech) {
      gatherAndSay(twiml, NO_INPUT_REPLY);
      return reply.header("Content-Type", "text/xml").send(twiml.toString());
    }

    // Langflow's Memory component keeps the conversation for this call, keyed by CallSid as the session id.
    const answer = await answerReceptionistTurn(speech, body.CallSid ?? "unknown");

    gatherAndSay(twiml, answer);
    reply.header("Content-Type", "text/xml").send(twiml.toString());
  });

  app.post("/status", async (req, reply) => {
    if (!hasValidSignature(req)) return reply.status(403).send();
    reply.status(204).send();
  });
};

export default voiceRoutes;
