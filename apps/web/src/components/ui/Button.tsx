import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "mint" | "accent" | "glass" | "outline" | "outline-light" | "white" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[var(--ease-out-quart)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint-300/60 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-forest-900 text-white shadow-[0_8px_20px_-10px_rgb(10_50_41/0.6)] hover:bg-forest-800 hover:shadow-[0_14px_28px_-12px_rgb(10_50_41/0.6)] hover:-translate-y-0.5",
  mint: "bg-mint-300 text-forest-950 hover:bg-mint-400 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgb(126_211_148/0.9)]",
  accent: "bg-mint-500 text-forest-950 hover:bg-mint-600 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgb(113_217_138/0.8)]",
  glass: "glass-pill text-white hover:bg-white/20 hover:-translate-y-0.5",
  outline: "border border-forest-900/25 text-forest-900 hover:border-forest-900 hover:bg-forest-900 hover:text-white",
  "outline-light": "border border-white/55 text-white hover:bg-white hover:text-forest-950 hover:border-white",
  white: "bg-white text-forest-950 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-14px_rgb(0_0_0/0.45)]",
  ghost: "text-forest-900 hover:bg-forest-900/6",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.85rem]",
  md: "h-12 px-7 text-[0.95rem]",
  lg: "h-14 px-9 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
}
type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type LinkProps = BaseProps & { to: string; href?: undefined; target?: string };
type AnchorProps = BaseProps & { href: string; to?: undefined; target?: string; rel?: string };
export type Props = ButtonProps | LinkProps | AnchorProps;

const Arrow = () => (
  <ArrowRight
    aria-hidden="true"
    className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover/btn:translate-x-1"
  />
);

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(props, ref) {
  const { variant = "primary", size = "md", arrow, loading, className, children, ...rest } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <>
      {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
      <span>{children}</span>
      {arrow && !loading && <Arrow />}
    </>
  );
  if ("to" in rest && rest.to) {
    const { to, target } = rest as LinkProps;
    return (
      <Link to={to} target={target} className={cls}>
        {inner}
      </Link>
    );
  }
  if ("href" in rest && rest.href) {
    const { href, target, rel } = rest as AnchorProps;
    return (
      <a href={href} target={target} rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)} className={cls}>
        {inner}
      </a>
    );
  }
  const btn = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref} type={btn.type ?? "button"} {...btn} disabled={btn.disabled || loading} aria-busy={loading || undefined} className={cls}>
      {inner}
    </button>
  );
});
