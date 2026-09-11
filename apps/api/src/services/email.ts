import { env } from "../lib/env.js";
import type { FastifyBaseLogger } from "fastify";

interface Mail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/** Sends via Resend when configured; otherwise logs (safe for local dev). Never throws to callers. */
export async function sendMail(mail: Mail, log: FastifyBaseLogger) {
  if (!env.RESEND_API_KEY) {
    log.info({ to: mail.to, subject: mail.subject }, "[email:dev] would send");
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({ from: env.EMAIL_FROM, to: mail.to, subject: mail.subject, html: mail.html, replyTo: mail.replyTo });
  } catch (err) {
    log.error({ err }, "Email send failed");
  }
}

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const wrap = (title: string, rows: [string, unknown][]) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0a1f1a">
    <h2 style="color:#0a3229;margin:0 0 16px">${esc(title)}</h2>
    <table style="border-collapse:collapse;width:100%">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;color:#6b7280;width:160px;vertical-align:top">${esc(k)}</td><td style="padding:8px 0">${esc(v) || "—"}</td></tr>`,
        )
        .join("")}
    </table>
  </div>`;

export const templates = {
  newContact: (m: { name: string; email: string; phone: string; service?: string; message: string }) =>
    wrap("New contact message", [
      ["Name", m.name],
      ["Email", m.email],
      ["Phone", m.phone],
      ["Service", m.service],
      ["Message", m.message],
    ]),
  newHireRequest: (r: Record<string, unknown>) =>
    wrap("New hire request", [
      ["Name", r.fullName],
      ["Email", r.email],
      ["Phone", r.phone],
      ["Location", `${r.city}, ${r.country}`],
      ["Service", r.service],
      ["Plan", r.planSlug],
      ["Candidate", r.candidateId],
      ["Start", r.startDate],
      ["Live-in", r.liveIn ? "Yes" : "No"],
      ["Nationalities", (r.preferredNationalities as string[])?.join(", ")],
      ["Languages", (r.preferredLanguages as string[])?.join(", ")],
      ["Notes", r.notes],
    ]),
  customerAck: (name: string) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0a1f1a">
      <h2 style="color:#0a3229">Thank you, ${esc(name)}</h2>
      <p>We've received your request. A MaidHire consultant will contact you within 24 hours to understand your needs and shortlist verified candidates.</p>
      <p style="color:#6b7280;font-size:13px">MaidHire · Dubai · Riyadh</p>
    </div>`,
  newApplication: (c: Record<string, unknown>) =>
    wrap("New candidate application", [
      ["Name", `${c.firstName} ${c.lastName}`],
      ["Phone", c.phone],
      ["Nationality", c.nationality],
      ["Location", `${c.currentCity}, ${c.currentCountry}`],
      ["Service", c.primaryService],
      ["Experience", `${c.yearsExperience} years`],
    ]),
};
