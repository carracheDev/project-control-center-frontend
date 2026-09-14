"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NotificationSetup } from "@/components/notification-setup";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { logout } from "@/lib/api";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", match: ["/dashboard", "/"] },
  {
    href: "/projects",
    label: "Projets",
    match: ["/projects", "/phases", "/questionnaires", "/interviews"],
  },
] as const;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (pathname === "/login") return <>{children}</>;

  const breadcrumbItems = buildBreadcrumbItems(pathname);

  return (
    <div className="flex min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <NotificationSetup />

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col bg-[var(--teal)] px-4 py-4 text-[#eaf4ef] transition-transform duration-200 md:static md:flex md:px-[18px] md:py-7 ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Link className="flex items-center gap-3 pb-4 md:pb-11" href="/dashboard" onClick={() => setIsMobileNavOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#ecb86b] font-['Space_Grotesk'] font-bold text-[var(--teal)]" aria-hidden="true">P</span>
          <span className="leading-none">
            <strong className="block text-[15px] tracking-[0.06em]">PCC</strong>
            <small className="mt-1 block text-[10px] text-[#9cb7b3]">Project Control Center</small>
          </span>
        </Link>

        <nav className="flex gap-1 md:grid md:gap-1" aria-label="Navigation principale">
          {navItems.map((item) => {
            const isActive = item.match.some((match) => {
              if (match === "/") return pathname === "/" || pathname === "/dashboard";
              return pathname === match || pathname.startsWith(`${match}/`);
            });

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex flex-1 items-center justify-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-colors md:justify-start ${
                  isActive ? "bg-white/10 text-white" : "text-[#a8c2bd] hover:bg-white/[0.04] hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span aria-hidden="true" className={isActive ? "text-[#ecb86b]" : "text-[#80a39e]"}>
                  {item.label === "Vue d'ensemble" ? "◈" : "▤"}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden items-center gap-2 border-t border-white/10 px-3 py-3 text-[11px] text-[#91aaa7] md:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#70cf9c] shadow-[0_0_0_4px_rgba(112,207,156,0.14)]" aria-hidden="true" />
          <span>API locale connectée</span>
          <button
            className="ml-auto border-0 bg-transparent p-0 text-[11px] text-[#b9cfca]"
            type="button"
            title="Se déconnecter"
            onClick={() => {
              void logout().finally(() => router.replace("/login"));
            }}
          >
            Quitter
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(255,253,249,0.96)] backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Ouvrir le menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--ink)] md:hidden"
                onClick={() => setIsMobileNavOpen((current) => !current)}
              >
                {isMobileNavOpen ? "✕" : "☰"}
              </button>
              <Breadcrumbs items={breadcrumbItems} />
            </div>

            <span className="hidden rounded border border-[#c9d9d3] px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#4e7975] md:inline-flex">
              PILOTAGE
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function buildBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const normalizedPath = pathname === "/" ? "/dashboard" : pathname;

  if (normalizedPath === "/dashboard") {
    return [{ label: "Vue d'ensemble" }];
  }

  if (normalizedPath === "/projects") {
    return [{ label: "Projets" }];
  }

  if (normalizedPath === "/projects/new") {
    return [
      { label: "Projets", href: "/projects" },
      { label: "Nouveau projet" },
    ];
  }

  if (normalizedPath.startsWith("/projects/")) {
    return [
      { label: "Projets", href: "/projects" },
      { label: "Projet" },
    ];
  }

  if (normalizedPath.startsWith("/phases/")) {
    return [
      { label: "Projets", href: "/projects" },
      { label: "Phase" },
    ];
  }

  if (normalizedPath.startsWith("/questionnaires/")) {
    return [
      { label: "Projets", href: "/projects" },
      { label: "Questionnaire" },
    ];
  }

  if (normalizedPath.startsWith("/interviews/")) {
    return [
      { label: "Projets", href: "/projects" },
      { label: "Interview" },
    ];
  }

  return [{ label: "Vue d'ensemble", href: "/dashboard" }];
}
