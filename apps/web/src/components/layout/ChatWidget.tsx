import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Mic, MicOff, Send, Sparkles, User, X } from "lucide-react";
import { useSendChatMessage } from "@/lib/chat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  fallback?: boolean;
}

const GREETING: Message = {
  id: "greeting",
  role: "bot",
  text: "Hi! I'm the MaidHire assistant. Ask me anything about our services, pricing, verification process or how hiring works.",
};

const STARTERS = ["How does verification work?", "What's included in the Premium plan?", "Do you help with visas?"];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const reduce = useReducedMotion();
  const send = useSendChatMessage();
  const listRef = useRef<HTMLDivElement>(null);

  const { supported: micSupported, listening, start: startListening, stop: stopListening } = useSpeechRecognition((transcript) => setInput(transcript));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, send.isPending]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const history = messages.filter((m) => m.id !== "greeting").map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    send.mutate(
      { message: trimmed, history },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: data.reply, fallback: data.fallback }]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "bot", text: "Something went wrong reaching the assistant. Please try again, or reach us on WhatsApp.", fallback: true },
          ]);
        },
      },
    );
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        initial={reduce ? false : { opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="chat-fab-glass animate-gold-pulse fixed bottom-24 right-5 z-40 isolate flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-white sm:bottom-28 sm:right-7"
      >
        <span className="liquid-sheen rounded-full" aria-hidden="true" />
        {open ? <X aria-hidden="true" className="relative h-6 w-6" /> : <Bot aria-hidden="true" className="relative h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="MaidHire chat assistant"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="chat-panel-glass fixed bottom-[9.75rem] right-5 z-40 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl sm:bottom-[12.25rem] sm:right-7"
          >
            <div className="chat-header-glass relative isolate flex items-center justify-between overflow-hidden px-4 py-3.5 text-white">
              <span className="liquid-sheen" aria-hidden="true" />
              <div className="relative flex items-center gap-2.5">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-white/12 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]">
                  <Bot aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.95rem] font-bold leading-tight">MaidHire Assistant</p>
                  <p className="text-[0.75rem] text-white/70">Ask about services, pricing & more</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden="true" className="h-4.5 w-4.5" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      m.role === "bot" ? "border border-gold-500/40 bg-forest-900/85 text-white" : "border border-white/50 bg-mint-300/80 text-forest-950 backdrop-blur",
                    )}
                  >
                    {m.role === "bot" ? <Bot aria-hidden="true" className="h-4 w-4" /> : <User aria-hidden="true" className="h-4 w-4" />}
                  </span>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[0.88rem] leading-relaxed",
                      m.role === "user"
                        ? "chat-bubble-user rounded-br-sm text-white"
                        : cn("chat-bubble-bot rounded-bl-sm text-ink-900", m.fallback && "border-gold-500/50"),
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {send.isPending && (
                <div className="flex items-end gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-forest-900/85 text-white">
                    <Bot aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="chat-bubble-bot rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                    <TypingDots />
                  </div>
                </div>
              )}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="chat-pill-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium text-ink-700 transition-colors hover:border-gold-500/50"
                    >
                      <Sparkles aria-hidden="true" className="h-3 w-3 text-mint-600" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="chat-input-glass flex items-center gap-2 border-t border-white/40 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              {micSupported && (
                <button
                  type="button"
                  onClick={() => (listening ? stopListening() : startListening())}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                  aria-pressed={listening}
                  className={cn(
                    "chat-pill-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                    listening ? "border-danger-500/60 bg-danger-500/85 text-white" : "text-ink-700 hover:border-gold-500/50",
                  )}
                >
                  {listening ? <MicOff aria-hidden="true" className="h-4.5 w-4.5" /> : <Mic aria-hidden="true" className="h-4.5 w-4.5" />}
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening…" : "Type a message…"}
                aria-label="Message"
                className="chat-pill-glass h-10 flex-1 rounded-xl px-3.5 text-[0.9rem] text-ink-900 placeholder:text-ink-500 focus:border-gold-500/60 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
              />
              <button
                type="submit"
                disabled={!input.trim() || send.isPending}
                aria-label="Send message"
                className="chat-fab-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
