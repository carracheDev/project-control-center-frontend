"use client";

export default function OfflinePage() {
  return <main className="grid min-h-screen place-items-center bg-canvas px-6"><div className="max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Connexion indisponible</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">PCC est temporairement hors ligne</h1><p className="mt-3 text-sm leading-6 text-muted">Les données et mutations nécessitent une connexion au serveur. Réessayez lorsque le réseau sera disponible.</p><button className="mt-6 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white" type="button" onClick={() => window.location.reload()}>Réessayer</button></div></main>;
}
