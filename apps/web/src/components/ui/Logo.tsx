import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  /** `light` = white wordmark for dark backgrounds; `dark` = forest wordmark for light backgrounds. */
  tone?: "light" | "dark";
  className?: string;
  asLink?: boolean;
}

/** Recreated faithfully from the mockups: house + person outline with a mint dot; "Maid" + mint "Hire". */
export function Logo({ tone = "light", className, asLink = true }: Props) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true" className="shrink-0">
        <path
          d="M12 30 32 13l20 17v20a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z"
          fill="none"
          stroke={tone === "light" ? "#ffffff" : "#0a3229"}
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="32" cy="35" r="5" fill={tone === "light" ? "#ffffff" : "#0a3229"} />
        <path d="M22.5 50c1-6.5 4.5-9.5 9.5-9.5s8.5 3 9.5 9.5z" fill={tone === "light" ? "#ffffff" : "#0a3229"} />
        <circle cx="47" cy="19" r="6.5" fill="#71d98a" />
      </svg>
      <span className="font-sans text-[1.55rem] font-extrabold tracking-[-0.03em] leading-none">
        <span className={tone === "light" ? "text-white" : "text-forest-900"}>Maid</span>
        <span className="text-mint-500">Hire</span>
      </span>
    </span>
  );
  return asLink ? (
    <Link to="/" aria-label="MaidHire home" className="inline-flex rounded-md">
      {mark}
    </Link>
  ) : (
    mark
  );
}
