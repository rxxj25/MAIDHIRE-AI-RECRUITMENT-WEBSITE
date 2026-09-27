import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { env } from "../lib/env.js";
import { answerReceptionistTurn } from "../services/voice.js";

interface VapiChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
}

interface VapiChatCompletionRequest {
  model?: string;
  messages?: VapiChatMessage[];
  stream?: boolean;
  call?: { id?: string };
}

/** Confirms the request carries the shared secret configured in Vapi's assistant (Custom LLM > Headers). Skipped (with a warning) if VAPI_SERVER_SECRET isn't set, so local testing works before that's configured. */
function hasValidSecret(req: FastifyRequest): boolean {
  if (!env.VAPI_SERVER_SECRET) {
    console.warn("VAPI_SERVER_SECRET not set — skipping Vapi request auth check (do not run production like this)");
    return true;
  }
  return req.headers.authorization === `Bearer ${env.VAPI_SERVER_SECRET}`;
}

const vapiRoutes: FastifyPluginAsync = async (app) => {
  /* ---- Vapi "Custom LLM" endpoint: OpenAI-chat-completions-shaped, backed by the same Langflow receptionist flow as the Twilio phone channel and website chat ---- */
  app.post("/chat/completions", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (req, reply) => {
    if (!hasValidSecret(req)) return reply.status(401).send();

    const body = req.body as VapiChatCompletionRequest;
    const lastUserMessage = [...(body.messages ?? [])].reverse().find((m) => m.role === "user")?.content?.trim();
    // Vapi's session/session id lives on call.id; fall back to a constant so a misconfigured request still gets a reply instead of erroring.
    const sessionId = body.call?.id ? `vapi-${body.call.id}` : "vapi-unknown";
    const answer = lastUserMessage ? await answerReceptionistTurn(lastUserMessage, sessionId) : "Sorry, could you say that again?";

    const created = Math.floor(Date.now() / 1000);
    const id = `chatcmpl-${sessionId}-${created}`;

    if (body.stream) {
      reply.raw.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      reply.raw.write(
        `data: ${JSON.stringify({ id, object: "chat.completion.chunk", created, model: body.model ?? "maidhire-receptionist", choices: [{ index: 0, delta: { role: "assistant", content: answer }, finish_reason: null }] })}\n\n`,
      );
      reply.raw.write(
        `data: ${JSON.stringify({ id, object: "chat.completion.chunk", created, model: body.model ?? "maidhire-receptionist", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`,
      );
      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
      return;
    }

    return {
      id,
      object: "chat.completion",
      created,
      model: body.model ?? "maidhire-receptionist",
      choices: [{ index: 0, message: { role: "assistant", content: answer }, finish_reason: "stop" }],
    };
  });
};

export default vapiRoutes;
