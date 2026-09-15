"use client";

import { FormEvent, useState } from "react";
import type { Question, Response } from "@/types/domain";

export function ResponseField({ question, response, isSubmitting, onSave, onDelete }: { question: Question; response?: Response; isSubmitting: boolean; onSave: (value: string) => Promise<void>; onDelete: () => Promise<void> }) {
  const [value, setValue] = useState(response?.value ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) { setError("Une réponse est nécessaire."); return; }
    setError(null);
    await onSave(value);
  }

  function control() {
    const fieldClass = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-accent-400 focus:ring-2 focus:ring-amber-100";
    if (question.type === "LONG_TEXT") return <textarea className={fieldClass} rows={3} value={value} onChange={(event) => setValue(event.target.value)} />;
    if (question.type === "BOOLEAN") return <select className={fieldClass} value={value} onChange={(event) => setValue(event.target.value)}><option value="">Choisir...</option><option value="true">Oui</option><option value="false">Non</option></select>;
    if (question.type === "SINGLE_CHOICE") return <select className={fieldClass} value={value} onChange={(event) => setValue(event.target.value)}><option value="">Choisir...</option>{question.options.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}</select>;
    if (question.type === "MULTIPLE_CHOICE") return <input className={fieldClass} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Valeurs séparées par des virgules" />;
    if (question.type === "NUMBER") return <input className={fieldClass} type="number" value={value} onChange={(event) => setValue(event.target.value)} />;
    if (question.type === "DATE") return <input className={fieldClass} type="date" value={value} onChange={(event) => setValue(event.target.value)} />;
    return <input className={fieldClass} value={value} onChange={(event) => setValue(event.target.value)} />;
  }

  return <form className="space-y-3" onSubmit={submit}><label className="block">{control()}</label><div className="flex flex-wrap items-center gap-3"><button className="rounded-lg bg-brand-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : response ? "Mettre à jour" : "Enregistrer"}</button>{response && <button className="px-2 py-2 text-xs font-semibold text-muted hover:text-ink" type="button" onClick={() => void onDelete()}>Effacer</button>}</div>{error && <small className="text-xs text-danger">{error}</small>}</form>;
}