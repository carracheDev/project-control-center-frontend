"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/lib/api";
import { NotificationSetup } from "@/components/notification-setup";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/login") return <>{children}</>;
  const isProjectsRoute = pathname.startsWith("/projects");
  const isDashboardRoute = pathname === "/" || pathname.startsWith("/dashboard");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <NotificationSetup />
      <aside className="flex w-full shrink-0 flex-col bg-[var(--teal)] px-4 py-4 text-[#eaf4ef] md:w-[248px] md:px-[18px] md:py-7">
        <Link className="flex items-center gap-3 pb-4 md:pb-11" href="/dashboard">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#ecb86b] font-['Space_Grotesk'] font-bold text-[var(--teal)]" aria-hidden="true">P</span>
          <span><strong>PCC</strong><small>Project Control Center</small></span>
        </Link>
        <nav className="flex gap-1 md:grid md:gap-1" aria-label="Navigation principale">
          <Link className={`flex flex-1 items-center justify-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold md:justify-start ${isDashboardRoute ? "bg-white/10 text-white" : "text-[#a8c2bd]"}`} href="/dashboard">
            <span aria-hidden="true">◈</span> Vue d&apos;ensemble
          </Link>
          <Link className={`flex flex-1 items-center justify-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold md:justify-start ${isProjectsRoute ? "bg-white/10 text-white" : "text-[#a8c2bd]"}`} href="/projects">
            <span aria-hidden="true">▤</span> Projets
          </Link>
        </nav>
        <div className="mt-auto hidden items-center gap-2 border-t border-white/10 px-3 py-3 text-[11px] text-[#91aaa7] md:flex">
          <span className="status-dot" aria-hidden="true" />
          <span>API locale connectée</span>
          <button className="shell-logout" type="button" title="Se déconnecter" onClick={() => { void logout().finally(() => router.replace("/login")); }}>Quitter</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-12 items-center justify-between border-b border-[var(--line)] bg-[rgba(255,253,249,.72)] px-[5.5%] md:h-[66px]">
          <span className="text-xs text-[var(--muted)]">Workspace / {isProjectsRoute ? "Projets" : "Vue d'ensemble"}</span>
          <span className="rounded border border-[#c9d9d3] px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#4e7975]">PILOTAGE</span>
        </header>
        {children}
      </div>
    </div>
  );
}