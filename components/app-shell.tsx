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
    <div className="app-frame">
      <NotificationSetup />
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-symbol" aria-hidden="true">P</span>
          <span><strong>PCC</strong><small>Project Control Center</small></span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <Link className={`nav-link ${isDashboardRoute ? "nav-link-active" : ""}`} href="/dashboard">
            <span aria-hidden="true">◈</span> Vue d&apos;ensemble
          </Link>
          <Link className={`nav-link ${isProjectsRoute ? "nav-link-active" : ""}`} href="/projects">
            <span aria-hidden="true">▤</span> Projets
          </Link>
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>API locale connectée</span>
          <button className="shell-logout" type="button" title="Se déconnecter" onClick={() => { void logout().finally(() => router.replace("/login")); }}>Quitter</button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span className="topbar-context">Workspace / {isProjectsRoute ? "Projets" : "Vue d'ensemble"}</span>
          <span className="topbar-badge">PILOTAGE</span>
        </header>
        {children}
      </div>
    </div>
  );
}