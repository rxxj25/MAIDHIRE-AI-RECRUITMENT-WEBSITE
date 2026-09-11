import { Suspense } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Inbox, MessageSquare, CreditCard, LogOut, ExternalLink } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAdminLogout, useAdminMe } from "@/lib/admin";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", Icon: LayoutDashboard, end: true },
  { to: "/admin/candidates", label: "Candidates", Icon: Users },
  { to: "/admin/requests", label: "Hire Requests", Icon: Inbox },
  { to: "/admin/messages", label: "Messages", Icon: MessageSquare },
  { to: "/admin/plans", label: "Plans", Icon: CreditCard },
];

export function AdminShell() {
  const { data, isLoading, isError } = useAdminMe();
  const logout = useAdminLogout();
  if (isLoading) return <div className="min-h-dvh bg-cream-100"><Spinner label="Checking session" /></div>;
  if (isError || !data) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-dvh bg-cream-100 text-ink-900">
      <aside className="hidden w-64 shrink-0 flex-col bg-forest-950 px-5 py-6 text-white lg:flex">
        <Logo tone="light" />
        <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-mint-400">Admin</p>
        <nav aria-label="Admin" className="mt-8 flex-1">
          <ul className="space-y-1">
            {NAV.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white", isActive && "bg-white/10 text-white")}>
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
        </a>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="truncate text-sm font-semibold">{data.user.name}</p>
          <p className="truncate text-xs text-white/50">{data.user.email}</p>
          <button type="button" onClick={() => logout.mutate()} className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-forest-900/10 bg-white px-4 py-3 lg:hidden">
          <Logo tone="dark" />
          <button type="button" onClick={() => logout.mutate()} className="text-sm font-medium text-ink-700">
            Sign out
          </button>
        </header>
        <nav aria-label="Admin (mobile)" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-forest-900/10 bg-white px-3 py-2 lg:hidden">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn("whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium", isActive ? "bg-forest-900 text-white" : "text-ink-700")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
