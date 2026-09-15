"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { getNotifications, markNotificationRead, resolveNotification } from "@/lib/api";
import type { AppNotification } from "@/types/domain";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    void getNotifications().then(setNotifications).catch(() => undefined);
  }, []);

  const unreadCount = notifications.filter((notification) => notification.status === "UNREAD").length;

  async function markRead(notification: AppNotification) {
    if (notification.status !== "UNREAD") return;
    const updated = await markNotificationRead(notification.id);
    setNotifications((items) => items.map((item) => item.id === updated.id ? updated : item));
  }

  async function resolve(notification: AppNotification) {
    const updated = await resolveNotification(notification.id);
    setNotifications((items) => items.filter((item) => item.id !== updated.id));
  }

  return <div className="relative">
    <button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ""}`} className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-panel text-ink" onClick={() => setIsOpen((value) => !value)}>
      <Bell size={16} />
      {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
    {isOpen && <div className="absolute right-0 top-10 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3"><strong className="text-sm text-ink">Notifications</strong><span className="text-xs text-muted">{notifications.length} actives</span></div>
      {notifications.length === 0 ? <p className="px-4 py-6 text-sm text-muted">Aucune notification active.</p> : <div className="max-h-[min(420px,70vh)] overflow-y-auto">{notifications.map((notification) => <article className={`border-b border-line px-4 py-3 ${notification.status === "UNREAD" ? "bg-amber-50/60" : "bg-surface"}`} key={notification.id}><div className="flex gap-3"><span className="mt-0.5 text-accent-400"><Bell size={15} /></span><div className="min-w-0 flex-1"><strong className="block text-xs text-ink">{notification.title}</strong><p className="mt-1 text-xs leading-5 text-muted">{notification.body}</p><div className="mt-2 flex items-center gap-3"><button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-900" onClick={() => void markRead(notification)}><Check size={12} /> Lu</button>{notification.projectId && <Link className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-900" href={`/projects/${notification.projectId}`} onClick={() => void markRead(notification)}><ExternalLink size={12} /> Projet</Link>}<button type="button" className="text-[11px] font-semibold text-muted hover:text-ink" onClick={() => void resolve(notification)}>Résoudre</button></div></div></div></article>)}</div>}
    </div>}
  </div>;
}