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

  return <main className="login-page"><section className="login-panel"><div className="login-brand"><span className="brand-symbol" aria-hidden="true">P</span><div><strong>PCC</strong><small>Project Control Center</small></div></div><p className="eyebrow">Espace sécurisé</p><h1>Se connecter</h1><p className="page-lede">Accédez au pilotage de vos projets.</p><form className="form-panel login-form" onSubmit={submit}><label htmlFor="email">Email<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label htmlFor="password">Mot de passe<input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={isLoading}>{isLoading ? "Connexion..." : "Se connecter"}</button></form></section></main>;
}