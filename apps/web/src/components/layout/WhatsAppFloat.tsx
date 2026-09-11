import { motion, useReducedMotion } from "framer-motion";
import { whatsappLink } from "@/lib/utils";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true" fill="currentColor">
    <path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.6.8 5.1 2.2 7.2L3 29l6.2-2.1c2 1.1 4.4 1.7 6.8 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.2-.6-6-1.7l-.4-.3-3.7 1.2 1.2-3.6-.3-.4A10.4 10.4 0 0 1 5.4 15.8C5.4 10 10.2 5.4 16 5.4s10.6 4.6 10.6 10.4S21.8 26.4 16 26.4zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
  </svg>
);

/** WhatsApp is the primary contact channel in the Gulf — keep it one tap away everywhere. */
export function WhatsAppFloat() {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={whatsappLink("Hello MaidHire, I'd like help finding a domestic helper.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={reduce ? false : { opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.7)] sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon />
    </motion.a>
  );
}
