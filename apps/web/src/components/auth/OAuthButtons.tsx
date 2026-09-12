import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.6H1.27a12 12 0 0 0 0 10.8l4-3.13Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.6l4 3.13c.94-2.85 3.6-4.96 6.73-4.96Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
      <path d="M16.36 1.02c.1 1.01-.29 2-.87 2.73-.6.75-1.6 1.34-2.57 1.26-.13-.99.34-2.02.9-2.67.62-.73 1.7-1.28 2.54-1.32ZM20.4 17.2c-.4.93-.87 1.8-1.5 2.6-.85 1.08-1.55 1.83-2.47 1.85-.87.02-1.16-.56-2.42-.56-1.27 0-1.6.55-2.42.58-.89.03-1.57-.83-2.43-1.9-1.66-2.08-2.93-5.88-1.23-8.45.85-1.28 2.35-2.09 3.99-2.11 1.03-.02 1.94.66 2.56.66.6 0 1.75-.82 2.97-.7.5.02 1.93.2 2.85 1.53-.07.05-1.7 1-1.68 2.97.02 2.36 2.07 3.15 2.78 3.53Z" />
    </svg>
  );
}

interface Props {
  className?: string;
}

/**
 * Google/Apple sign-in requires real OAuth client credentials from each provider's console —
 * left visually in place but inert until those are configured on the backend.
 */
export function OAuthButtons({ className }: Props) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {[
        { label: "Continue with Google", icon: <GoogleIcon /> },
        { label: "Continue with Apple", icon: <AppleIcon /> },
      ].map(({ label, icon }) => (
        <button
          key={label}
          type="button"
          disabled
          title="Coming soon — needs OAuth setup"
          className="inline-flex h-14 cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-forest-900/15 bg-white text-[0.92rem] font-semibold text-ink-700 opacity-60"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
