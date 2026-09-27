import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { REQUEST_STATUSES } from "@maidhire/shared";
import { useAdminMe, useAdminStats, useAdminRequests } from "@/lib/admin";
import { DeltaBadge, DonutChart, TrendAreaChart, type DonutSlice } from "@/components/admin/charts";
import { Spinner } from "@/components/ui/Spinner";
import { cn, formatDate, formatDateTime, titleCase } from "@/lib/utils";

const TREND_RANGES = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
] as const;

function TrendRangeMenu({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const current = TREND_RANGES.find((r) => r.days === days) ?? TREND_RANGES[0];
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-[#DAD6CC] px-2.5 py-1 text-[12px] font-medium text-[#14170F] hover:bg-[#F4F2EC]"
      >
        {current.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14170F" strokeWidth="2.4" strokeLinecap="round" className={cn("transition-transform", open && "rotate-180")} aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1.5 w-36 rounded-lg bg-white p-1 shadow-[0_10px_30px_rgba(20,23,15,0.12)] ring-1 ring-[#ECE8DE]">
          {TREND_RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => {
                onChange(r.days);
                setOpen(false);
              }}
              className={cn("block w-full rounded-md px-2.5 py-1.5 text-left text-[13px]", r.days === days ? "bg-[#E4F3EA] font-semibold text-[#17684A]" : "text-[#14170F] hover:bg-[#F4F2EC]")}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const REQUEST_STATUS_COLOR: Record<string, string> = {
  NEW: "#22B5A0",
  CONTACTED: "#5B93D1",
  MATCHING: "#F4C24E",
  INTERVIEWING: "#9C8ADE",
  PLACED: "#17684A",
  CLOSED: "#A9B4B0",
};

const STATUS_PILL: Record<string, { bg: string; fg: string }> = {
  NEW: { bg: "#ECEBE7", fg: "#555A53" },
  CONTACTED: { bg: "#DCEEFB", fg: "#1F5E9E" },
  MATCHING: { bg: "#FDEBC2", fg: "#9A5B00" },
  INTERVIEWING: { bg: "#EFEBF8", fg: "#6B46C1" },
  PLACED: { bg: "#DDF3E4", fg: "#17684A" },
  CLOSED: { bg: "#F1EFEA", fg: "#8B8F87" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/** REQUEST_STATUSES are SCREAMING_CASE constants — titleCase() only capitalizes word starts, so it leaves them all-caps. Lowercase first to get "Interviewing" instead of "INTERVIEWING". */
function statusLabel(s: string) {
  return titleCase(s.toLowerCase());
}

function KpiIcon({ d, size = 24 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#14170F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

export default function DashboardPage() {
  const { data: me } = useAdminMe();
  const { data: s, isLoading } = useAdminStats();
  const { data: recent } = useAdminRequests({ pageSize: 4 });
  const [trendDays, setTrendDays] = useState(7);
  if (isLoading || !s) return <Spinner />;

  const trendData = s.trend.slice(-trendDays);

  const firstName = me?.user.name.split(" ")[0] ?? "Admin";
  const activeCandidates = s.candidates.total - (s.candidates.byStatus.INACTIVE ?? 0);

  const tiles = [
    { label: "Total Hire Requests", value: s.requests.total, delta: s.deltas.requests30d, to: "/admin/requests", bg: "#E8F4EC", iconBg: "#BFE6CD", d: "M9 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.5a3 3 0 010 5.5M18 14c2 .5 3 2.5 3 5" },
    { label: "Active Candidates", value: activeCandidates, delta: s.deltas.candidates30d, to: "/admin/candidates", bg: "#E4F4EF", iconBg: "#BDE8DA", d: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7" },
    { label: "Unread Messages", value: s.messages.unread, delta: s.deltas.messages30d, to: "/admin/messages", bg: "#E5F2F6", iconBg: "#BFE2EC", d: "M4 5h16v12H4zM8 9v4M12 9v4M16 9v4" },
    { label: "Total Hires", value: s.hires.total, delta: s.deltas.hires30d, to: "/admin/requests?status=PLACED", bg: "#EFEBF8", iconBg: "#D8CFF1", d: "M5 5h14v15H5zM5 10h14M9 3v4M15 3v4" },
  ];

  const donutSlices: DonutSlice[] = REQUEST_STATUSES.map((st) => ({ label: st, value: s.requests.byStatus[st] ?? 0, color: REQUEST_STATUS_COLOR[st] }));

  const quickActions = [
    { label: "New Candidate", to: "/join", external: true, d: "M12 8v8M8 12h8M12 21a9 9 0 100-18 9 9 0 000 18z" },
    { label: "New Request", to: "/contact", external: true, d: "M7 3h10v18H7zM10 8h4M10 12h4M10 16h2" },
    { label: "Reports", to: "/admin/reports", d: "M4 20h16M7 20v-6M11 20V8M15 20v-9M19 20V5" },
    { label: "Plans", to: "/admin/plans", d: "M4 5h16v14H4zM4 10h16" },
  ];

  return (
    <div className="font-['Inter']">
      {/* Greeting banner — bleeds to the shell's edges on desktop */}
      <section className="relative -mx-4 -mt-4 flex flex-col gap-3 overflow-hidden bg-[#F8F4EC] px-6 py-9 sm:-mx-6 sm:-mt-6 lg:-mx-10 lg:-mt-10 lg:min-h-[238px] lg:px-10">
        {/*
          This photo already has "Better Homes, Happier Lives" composed into it, so it's shown as-is with no extra text overlay.
          The left edge fades via a mask on the image itself (revealing the section's own cream bg behind it) rather than a
          separate cream rectangle drawn on top — a same-size overlay risked washing out the baked-in text near the seam.
          Hidden below lg: too narrow for a bled photo without covering the copy.
        */}
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          <img
            src="/images/admin-banner.webp"
            alt="Better Homes, Happier Lives"
            className="h-full w-full object-cover [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_22%)] [mask-image:linear-gradient(to_right,transparent_0%,black_22%)]"
          />
        </div>
        <p className="relative text-[16px] font-semibold tracking-[0.08em] text-[#17684A]">{greeting().toUpperCase()}, {firstName.toUpperCase()}</p>
        <h1 className="relative max-w-[460px] font-['Source_Serif_4'] text-[40px] font-bold leading-[1.1] text-[#14170F] text-pretty">Here&rsquo;s what&rsquo;s happening today</h1>
        <p className="relative max-w-[400px] text-[18px] leading-[1.45] text-[#2A2E28]">Manage your team, track requests and ensure happy homes, all in one place.</p>
      </section>

      <div className="grid grid-cols-1 gap-[18px] py-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          {/* KPI tiles — one white card containing four tinted panels */}
          <div className="grid grid-cols-1 gap-3 rounded-[14px] bg-white p-3 shadow-[0_1px_3px_rgba(20,23,15,0.05)] sm:grid-cols-2 2xl:grid-cols-4">
            {tiles.map((t) => (
              <Link key={t.label} to={t.to} className="flex flex-col gap-2.5 rounded-xl px-3.5 pb-4 pt-3.5 transition hover:brightness-[0.98]" style={{ background: t.bg }}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: t.iconBg }}>
                    <KpiIcon d={t.d} size={18} />
                  </span>
                  <span className="min-w-0 text-[13px] font-bold leading-[1.25] text-[#14170F]">{t.label}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[28px] font-extrabold tracking-[-0.02em] text-[#14170F]">{t.value}</span>
                  <div className="flex flex-col gap-0.5">
                    <DeltaBadge pct={t.delta} />
                    {t.delta !== null && <span className="text-[11px] leading-tight text-[#3B403A]">vs last 30 days</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Trend + status breakdown — stacked until 2xl: at typical laptop widths the outer sidebar+right-column split already narrows this area, and splitting it again into two sub-columns here left the donut legend with no room (values were clipping past the panel edge). */}
          <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-3 rounded-[14px] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,23,15,0.05)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#14170F]">Hire Requests Overview</h2>
                <TrendRangeMenu days={trendDays} onChange={setTrendDays} />
              </div>
              <TrendAreaChart data={trendData} />
            </div>

            <div className="flex flex-col gap-3 rounded-[14px] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,23,15,0.05)]">
              <h2 className="text-[16px] font-bold text-[#14170F]">Request Status</h2>
              <div className="flex items-center gap-4">
                <DonutChart slices={donutSlices} total={s.requests.total} />
                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-[10px_minmax(0,1fr)_20px_32px] gap-2 border-b border-[#EFECE5] pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6B7069]">
                    <span />
                    <span>Status</span>
                    <span>Count</span>
                    <span className="text-right">%</span>
                  </div>
                  <ul className="space-y-2.5 pt-2.5 text-[13px] text-[#14170F]">
                  {donutSlices.map((sl) => {
                    const pct = s.requests.total ? Math.round((sl.value / s.requests.total) * 100) : 0;
                    return (
                      <li key={sl.label} className="grid grid-cols-[10px_minmax(0,1fr)_20px_32px] items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: sl.color }} />
                        <span className="truncate">{statusLabel(sl.label)}</span>
                        <span>{sl.value}</span>
                        <span className="text-right text-[#3B403A]">{pct}%</span>
                      </li>
                    );
                  })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Latest requests + quick actions */}
          <div className="grid grid-cols-1 gap-3.5 2xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-3.5 rounded-[14px] bg-white px-[22px] py-5 shadow-[0_1px_3px_rgba(20,23,15,0.05)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#14170F]">Latest Hire Requests</h2>
                <Link to="/admin/requests" className="text-[13px] font-semibold text-[#17684A] hover:text-[#0F4A34]">View All →</Link>
              </div>
              <div className="flex flex-col overflow-x-auto">
                <div className="grid min-w-[560px] grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_24px] gap-3 rounded-md bg-[#F4F2EC] px-2 py-[9px] text-[14px] font-medium text-[#14170F]">
                  <span>Customer</span><span>Location</span><span>Service</span><span>Status</span><span>Date</span><span />
                </div>
                {recent?.items.map((r) => {
                  const pill = STATUS_PILL[r.status] ?? STATUS_PILL.NEW;
                  return (
                    <Link key={r.id} to={`/admin/requests?open=${r.id}`} className="grid min-w-[560px] grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_24px] items-center gap-3 border-b border-[#EFECE5] px-2 py-3 text-[13px] text-[#14170F] hover:bg-[#FAF8F3]">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0E3526] text-[11px] font-bold text-white">{initials(r.fullName)}</span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-semibold">{r.fullName}</span>
                          <span className="truncate text-[12px] text-[#3B403A]">{r.phone}</span>
                        </span>
                      </span>
                      <span className="truncate text-[12px] leading-snug">{r.city}</span>
                      <span className="truncate">{titleCase(r.service)}</span>
                      <span className="justify-self-start rounded-full px-3 py-[5px] text-[12px] font-semibold" style={{ background: pill.bg, color: pill.fg }}>{statusLabel(r.status)}</span>
                      <span className="text-[12px]">{formatDateTime(r.createdAt)}</span>
                      <span className="text-center text-[18px] font-bold text-[#6B7069]">⋮</span>
                    </Link>
                  );
                })}
                {recent?.items.length === 0 && <p className="px-2 py-8 text-center text-sm text-[#6B7069]">No hire requests yet.</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3.5 rounded-[14px] bg-white px-5 py-5 shadow-[0_1px_3px_rgba(20,23,15,0.05)]">
              <h2 className="text-[18px] font-bold text-[#14170F]">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3.5">
                {quickActions.map((a) =>
                  a.external ? (
                    <a key={a.label} href={a.to} target="_blank" rel="noreferrer" className="flex min-h-[100px] flex-col gap-3.5 rounded-xl border border-[#E6E2D8] p-4 transition hover:-translate-y-[3px] hover:shadow-[0_10px_22px_rgba(20,23,15,0.1)]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#E4F3EA]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17684A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={a.d} /></svg>
                      </span>
                      <span className="text-[14px] font-medium leading-snug text-[#14170F]">{a.label}</span>
                    </a>
                  ) : (
                    <Link key={a.label} to={a.to} className="flex min-h-[100px] flex-col gap-3.5 rounded-xl border border-[#E6E2D8] p-4 transition hover:-translate-y-[3px] hover:shadow-[0_10px_22px_rgba(20,23,15,0.1)]">
                      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#E4F3EA]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17684A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={a.d} /></svg>
                      </span>
                      <span className="text-[14px] font-medium leading-snug text-[#14170F]">{a.label}</span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <div className="relative flex min-h-[232px] flex-col gap-3 overflow-hidden rounded-[14px] bg-[#F4ECDF] p-6">
            <img src="/images/parallax/maid-cutout.webp" alt="" className="absolute right-0 top-0 h-full w-auto object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#F4ECDF_0%,#F4ECDF_45%,rgba(244,236,223,0)_70%)]" />
            <h3 className="relative font-['Source_Serif_4'] text-[23px] font-bold leading-[1.15] text-[#14170F]">Quality Care.<br />Trusted People.</h3>
            <p className="relative max-w-[150px] text-[14px] leading-[1.4] text-[#2A2E28]">Verified &amp; background checked professionals for your home.</p>
            <a href="/contact" target="_blank" rel="noreferrer" className="relative mt-auto flex items-center gap-3.5 self-start rounded-md bg-[#0E3526] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#0B2B1F]">
              Post a New Request <span>→</span>
            </a>
          </div>

          <div className="flex flex-col rounded-[14px] bg-white px-5 pb-2 pt-5 shadow-[0_1px_3px_rgba(20,23,15,0.05)]">
            <div className="flex items-center gap-3 pb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17684A" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
              <h2 className="flex-1 text-[16px] font-bold text-[#14170F]">Interview Pipeline</h2>
              <Link to="/admin/requests?status=INTERVIEWING" className="text-[11px] font-semibold text-[#17684A] hover:text-[#0F4A34]">View All →</Link>
            </div>
            {s.interviewPipeline.map((r) => (
              <Link key={r.id} to={`/admin/requests?open=${r.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-[#EFECE5] py-3.5 hover:bg-[#FAF8F3]">
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex gap-6 text-[14px]">
                    <span className="font-semibold text-[#14170F]">{r.startDate ? formatDate(r.startDate) : "Flexible start"}</span>
                    <span className="truncate text-[12px] text-[#3B403A]">{r.city}</span>
                  </div>
                  <span className="truncate text-[14px] font-semibold text-[#14170F]">{r.fullName} – {titleCase(r.service)}</span>
                </div>
                <span className="rounded-md px-[9px] py-[5px] text-[12px] font-semibold" style={{ background: STATUS_PILL[r.status]?.bg, color: STATUS_PILL[r.status]?.fg }}>{statusLabel(r.status)}</span>
              </Link>
            ))}
            {s.interviewPipeline.length === 0 && <p className="py-6 text-center text-sm text-[#6B7069]">Nothing in matching or interview stage right now.</p>}
          </div>

          <div className="mt-5 flex items-center gap-3.5 rounded-[14px] bg-[#E3EFE4] px-6 py-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true"><path d="M12 21C12 14 7 9 2 8c0 7 4 12 10 13z" fill="#56B87A" /><path d="M12 21c0-8 4-13 10-14 0 7-4 13-10 14z" fill="#2E9B5C" /></svg>
            <div className="flex flex-col">
              <span className="font-['Dancing_Script'] text-[26px] leading-[1.2] text-[#1C2A20]">Happy homes<br />build brighter futures</span>
              <svg width="110" height="11" viewBox="0 0 120 12" className="self-end"><path d="M2 10C40 4 80 2 118 3" stroke="#17684A" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
