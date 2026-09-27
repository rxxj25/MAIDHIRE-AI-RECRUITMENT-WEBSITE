import { cn } from "@/lib/utils";

export function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-[13px] font-semibold text-[#6B7069]">New</span>;
  const up = pct >= 0;
  return (
    <span className={cn("text-[13px] font-bold", up ? "text-[#17804F]" : "text-[#E8404B]")}>
      {up ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** Lightweight gradient area chart — no charting dependency, sized via viewBox so it scales with its container. */
export function TrendAreaChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return null;
  const W = 500;
  const H = 220;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  // Round the axis ceiling up to a clean multiple of 4 so the 4 evenly-spaced labels below are always whole numbers.
  const niceMax = Math.max(4, Math.ceil(Math.max(1, ...data.map((d) => d.count)) / 4) * 4);
  const stepX = W / Math.max(1, data.length - 1);
  const y = (v: number) => H - 1 - (v / niceMax) * (H - 9);
  const points = data.map((d, i) => [i * stepX, y(d.count)] as const);
  const line = points.map(([x, py], i) => `${i === 0 ? "M" : "L"}${x},${py}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${H - 1} L${points[0][0]},${H - 1} Z`;
  const last = data[data.length - 1];
  const lastPoint = points[points.length - 1];
  const yLabels = [4, 3, 2, 1, 0].map((i) => Math.round((niceMax / 4) * i));
  // Pick ~6 evenly spaced indices (always including the first and last) so date labels never crowd or overlap, regardless of how many points are passed in.
  const labelCount = Math.min(data.length, 7);
  const labelIndices = new Set(Array.from({ length: labelCount }, (_, i) => Math.round((i * (data.length - 1)) / Math.max(1, labelCount - 1))));

  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-1.5">
      <div className="flex h-[220px] flex-col justify-between text-right text-[11px] text-[#3B403A]">
        {yLabels.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[220px] w-full overflow-visible" role="img" aria-label="Hire requests trend">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2FB36B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2FB36B" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <g stroke="#ECE9E1" strokeWidth="1">
            {[0, 0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} />
            ))}
          </g>
          <line x1="0" y1={H - 1} x2={W} y2={H - 1} stroke="#BDB9AE" />
          {total === 0 && (
            <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="#6B7069">
              No hire requests in this period yet
            </text>
          )}
          <path d={area} fill="url(#trendFill)" />
          <path d={line} fill="none" stroke="#17804F" strokeWidth="2" />
          {points.map(([x, py], i) => (
            <circle key={i} cx={x} cy={py} r={i === points.length - 1 ? 5 : 3.5} fill="#17804F" stroke="#FFFFFF" strokeWidth={i === points.length - 1 ? 1.5 : 0} />
          ))}
          {lastPoint && (
            <g transform={`translate(${Math.min(Math.max(lastPoint[0] - 50, 0), W - 100)}, -10)`}>
              <rect width="100" height="40" rx="4" fill="#0E3526" />
              <text x="10" y="16" fill="#FFFFFF" fontSize="11" fontFamily="Inter">{DAY_LABEL.format(new Date(last.date))}</text>
              <circle cx="16" cy="30" r="3.5" fill="#3EDC81" />
              <text x="24" y="34" fill="#FFFFFF" fontSize="11" fontFamily="Inter">{last.count} {last.count === 1 ? "request" : "requests"}</text>
            </g>
          )}
        </svg>
        <div className="flex justify-between text-[11px] text-[#3B403A]">
          {data.map((d, i) => (
            <span key={d.date} className={cn(!labelIndices.has(i) && "invisible")}>{DAY_LABEL.format(new Date(d.date))}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface DonutSlice { label: string; value: number; color: string }

/** Simple SVG donut with a centered total and an external legend, rendered by the caller. */
export function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const size = 128;
  const r = 56;
  const stroke = 18;
  const c = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative h-[128px] w-[128px] shrink-0">
      <svg width={size} height={size} viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }} role="img" aria-label="Request status breakdown">
        {total === 0 && <circle cx={c} cy={c} r={r} fill="none" stroke="#ECE9E1" strokeWidth={stroke} />}
        {slices
          .filter((s) => s.value > 0)
          .map((s) => {
            const dash = (s.value / total) * circumference;
            const el = <circle key={s.label} cx={c} cy={c} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} />;
            offset += dash;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-[20px] font-extrabold text-[#14170F]">{total}</span>
        <span className="text-[10px] text-[#3B403A]">Total Requests</span>
      </div>
    </div>
  );
}
