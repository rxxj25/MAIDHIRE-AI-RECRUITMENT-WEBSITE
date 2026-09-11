import { Star } from "lucide-react";

export function Stars({ rating, count, className = "" }: { rating: number; count?: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Rated ${rating} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < full ? "fill-gold-500 text-gold-500" : "fill-cream-300 text-cream-300"}`} />
        ))}
      </span>
      <span className="text-[0.85rem] font-semibold text-ink-900">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-[0.85rem] text-ink-500">({count} reviews)</span>}
    </span>
  );
}
