"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FolderKanban, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { NotificationSetup } from "@/components/notification-setup";
import { NotificationCenter } from "@/components/notification-center";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { getPhase, getProject, logout } from "@/lib/api";

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
  const [context, setContext] = useState<{ project?: string; phase?: string }>({});

  useEffect(() => {
    const id = pathname.match(/\/(?:projects|phases)\/([^/]+)/)?.[1];
    if (!id || pathname.endsWith("/new")) return;
    if (pathname.startsWith("/projects/")) {
      void getProject(id).then((project) => setContext({ project: project.name })).catch(() => setContext({}));
      return;
    }
    if (pathname.startsWith("/phases/")) {
      void getPhase(id).then(async (phase) => {
        const project = await getProject(phase.projectId);
        setContext({ project: project.name, phase: `Phase ${phase.order} — ${phase.name}` });
      }).catch(() => setContext({}));
      return;
    }
  }, [pathname]);

  if (pathname === "/login") return <>{children}</>;

  const breadcrumbItems = buildBreadcrumbItems(pathname, context);

  return (
    <div className="app-shell-root flex min-h-screen bg-canvas text-ink">
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col bg-brand-900 px-4 py-4 text-[#f8fafc] transition-transform duration-200 md:static md:flex md:px-[18px] md:py-7 ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Link className="flex items-center gap-3 pb-4 md:pb-11" href="/dashboard" onClick={() => setIsMobileNavOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-accent-400 font-display font-bold text-brand-900" aria-hidden="true">P</span>
          <span className="leading-none">
            <strong className="block text-[15px] tracking-[0.06em]">PCC</strong>
            <small className="mt-1 block text-[10px] text-[#93a4c4]">Project Control Center</small>
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
                  isActive ? "bg-[#22304d] text-white" : "text-[#a8b7d1] hover:bg-white/[0.04] hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span aria-hidden="true" className={isActive ? "text-accent-400" : "text-[#7182a0]"}>
                  {item.label === "Vue d'ensemble" ? <LayoutDashboard size={15} strokeWidth={2} /> : <FolderKanban size={15} strokeWidth={2} />}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden items-center gap-2 border-t border-white/10 px-3 py-3 text-[11px] text-[#94a3c1] md:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-[#26d7a1] shadow-[0_0_0_4px_rgba(38,215,161,0.14)]" aria-hidden="true" />
          <span>API locale connectée</span>
          <button
            className="ml-auto border-0 bg-transparent p-0 text-[11px] text-[#c5d0e5]"
            type="button"
            title="Se déconnecter"
            onClick={() => {
              void logout().finally(() => router.replace("/login"));
            }}
          >
            <LogOut className="mr-1 inline" size={13} /> Quitter
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-line bg-[rgba(255,253,249,0.96)] backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Ouvrir le menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-sm text-ink md:hidden"
                onClick={() => setIsMobileNavOpen((current) => !current)}
              >
                {isMobileNavOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="flex items-center gap-3"><NotificationCenter /><span className="hidden rounded border border-[#c9d9d3] px-2 py-1 text-[9px] font-bold tracking-[.12em] text-[#4e7975] md:inline-flex">PILOTAGE</span></div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function buildBreadcrumbItems(pathname: string, context: { project?: string; phase?: string }): BreadcrumbItem[] {
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
      { label: context.project || "Projet" },
    ];
  }

  if (normalizedPath.startsWith("/phases/")) {
    return [
      { label: "Projets", href: "/projects" },
      ...(context.project ? [{ label: context.project }] : []),
      { label: context.phase || "Phase" },
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
