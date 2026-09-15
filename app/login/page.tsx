"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10"><section className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 shadow-sm"><div className="mb-10 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-900 font-display font-bold text-white" aria-hidden="true">P</span><div><strong className="block text-sm tracking-wider text-ink">PCC</strong><small className="text-xs text-muted">Project Control Center</small></div></div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted">Espace sécurisé</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Se connecter</h1><p className="mt-2 text-sm text-muted">Accédez au pilotage de vos projets.</p><form className="mt-7 space-y-5" onSubmit={submit}><label className="block text-sm font-medium text-ink" htmlFor="email">Email<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm" id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="block text-sm font-medium text-ink" htmlFor="password">Mot de passe<input className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm" id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-danger" role="alert">{error}</p>}<button className="w-full rounded-lg bg-brand-900 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-50" type="submit" disabled={isLoading}>{isLoading ? "Connexion..." : "Se connecter"}</button></form></section></main>;
}