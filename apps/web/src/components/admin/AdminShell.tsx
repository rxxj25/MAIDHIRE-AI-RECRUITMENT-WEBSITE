import { Suspense, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAdminLogout, useAdminMe, useAdminStats } from "@/lib/admin";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", end: true, d: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" },
  { to: "/admin/candidates", label: "Candidates", d: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.3 3.3 0 010 6.3M18 14c2 .6 3.5 2.8 3.5 6" },
  { to: "/admin/requests", label: "Hire Requests", d: "M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM9 3v2h6V3M9 10h6M9 14h6M9 18h3", badge: (s: { requests: { new: number } }) => s.requests.new },
  { to: "/admin/messages", label: "Messages", d: "M4 5h16v11H9l-5 4z", badge: (s: { messages: { unread: number } }) => s.messages.unread },
  { to: "/admin/plans", label: "Plans", d: "M3 6h18v13H3zM3 10h18M7 14h5" },
  { to: "/admin/reports", label: "Reports", d: "M4 20h16M6 20V10M10 20V5M14 20V12M18 20V8" },
  { to: "/admin/settings", label: "Settings", d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 01-1.7 1l-.3 2h-4l-.3-2a7 7 0 01-1.7-1l-1.9.7-2-3.4 1.6-1.2a7 7 0 010-3l-1.6-1.2 2-3.4 1.9.7a7 7 0 011.7-1l.3-2h4l.3 2a7 7 0 011.7 1l1.9-.7 2 3.4-1.6 1.2a7 7 0 010 3z" },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function AdminTopbar({ user, onLogout }: { user: { name: string; email: string }; onLogout: () => void }) {
  const navigate = useNavigate();
  const { data: stats } = useAdminStats();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const alerts = (stats?.messages.unread ?? 0) + (stats?.requests.new ?? 0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="hidden items-center gap-6 border-b border-[#ECE8DE] bg-[#FAF8F3] py-3.5 pl-9 pr-8 lg:flex">
      <form
        className="flex flex-[0_1_580px] items-center gap-3 rounded-xl bg-[#EFECE4] px-[18px] py-[13px]"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          if (q) navigate(`/admin/candidates?q=${encodeURIComponent(String(q))}`);
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B403A" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <input name="q" type="search" placeholder="Search candidates, requests, or locations..." className="flex-1 bg-transparent font-inherit text-[15px] text-[#14170F] placeholder:text-[#6B7069] focus:outline-none" />
      </form>
      <div className="ml-auto flex items-center gap-7">
        <NavLink to="/admin/messages" className="relative flex" aria-label="Notifications">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14170F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z" /><path d="M10 20a2 2 0 004 0" /></svg>
          {alerts > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FAF8F3] bg-[#E8404B]" aria-hidden="true" />}
        </NavLink>
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E3526] text-[15px] font-bold text-white">{initials(user.name)}</span>
            <span className="flex flex-col gap-0.5 text-left leading-tight">
              <span className="text-[16px] font-bold text-[#14170F]">{user.name.split(" ")[0]}</span>
              <span className="text-[14px] text-[#3B403A]">Super Admin</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14170F" strokeWidth="2" strokeLinecap="round" className={cn("transition-transform", menuOpen && "rotate-180")} aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-[0_10px_30px_rgba(20,23,15,0.12)] ring-1 ring-[#ECE8DE]">
              <p className="truncate px-3 py-2 text-xs text-[#6B7069]">{user.email}</p>
              <button type="button" onClick={onLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#14170F] hover:bg-[#F4F2EC]">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function AdminShell() {
  const { data, isLoading, isError } = useAdminMe();
  const { data: stats } = useAdminStats();
  const logout = useAdminLogout();
  if (isLoading) return <div className="min-h-dvh bg-[#F7F5EF]"><Spinner label="Checking session" /></div>;
  if (isError || !data) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-dvh bg-[#F7F5EF] text-[#14170F]">
      <aside className="sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col bg-gradient-to-b from-[#0E3526] to-[#0B2B1F] px-3.5 pb-[22px] pt-[18px] text-[#F5F4EF] lg:flex">
        <div className="flex items-center gap-2.5 px-1.5 pb-[26px] text-[34px] font-extrabold tracking-[-0.02em]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
            <path d="M4 12L12 5l8 7" stroke="#F5F4EF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11v7a1 1 0 001 1h10a1 1 0 001-1v-7" stroke="#F5F4EF" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="13.6" r="1.7" stroke="#F5F4EF" strokeWidth="1.3" />
            <path d="M9.2 18.3c0-1.7 1.2-2.8 2.8-2.8s2.8 1.1 2.8 2.8" stroke="#F5F4EF" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13.6 6.2c1.7-1.5 3.4-.9 3.4-.9s.3 1.8-1.2 3.1c-1 .8-2.2.6-2.2.6s-.2-1.3 0-2.8z" fill="#3EDC81" />
          </svg>
          <span>Maid<span className="text-[#3EDC81]">Hire</span></span>
        </div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {NAV.map((item) => {
            const badge = item.badge && stats ? item.badge(stats as never) : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-[18px] rounded-xl border px-[18px] py-4 text-[17px] font-medium text-[#F5F4EF] transition-colors",
                    isActive ? "border-[#3EDC81]/25 bg-[#3EDC81]/[0.14] font-semibold" : "border-transparent hover:bg-white/5",
                  )
                }
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F5F4EF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.d} /></svg>
                <span className="flex-1">{item.label}</span>
                {!!badge && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2FB36B] text-[13px] font-bold text-white">{badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-[18px] rounded-2xl border border-white/[0.16] bg-white/[0.03] p-5">
          <div className="flex items-center gap-3.5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true"><path d="M12 20C12 13 7 9 3 8c0 6 3 11 9 12z" fill="#7ED39A" /><path d="M12 20c0-7 4-11 9-12 0 6-3 11-9 12z" fill="#3EAF6A" /></svg>
            <div className="text-[16px] leading-snug">Making homes happier, together</div>
          </div>
          <div className="h-px bg-white/[0.16]" />
          <div className="flex items-center gap-3.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F4EF" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19c0 1.5-2 2.5-5 2.5" /></svg>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] opacity-80">Need help?</span>
              <a href="mailto:hello@maidhire.com" className="text-[14px] font-medium text-[#F5F4EF] hover:underline">Contact support</a>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => logout.mutate()} className="mt-4 truncate px-1.5 text-left text-[13px] text-white/50 hover:text-white">
          Signed in as {data.user.email} · Sign out
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-forest-900/10 bg-white px-4 py-3 lg:hidden">
          <span className="text-lg font-extrabold tracking-tight text-[#0E3526]">Maid<span className="text-[#17684A]">Hire</span></span>
          <button type="button" onClick={() => logout.mutate()} className="text-sm font-medium text-ink-700">
            Sign out
          </button>
        </header>
        <nav aria-label="Admin (mobile)" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-forest-900/10 bg-white px-3 py-2 lg:hidden">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn("whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium", isActive ? "bg-[#0E3526] text-white" : "text-ink-700")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <AdminTopbar user={data.user} onLogout={() => logout.mutate()} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
