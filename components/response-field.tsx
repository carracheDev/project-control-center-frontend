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
    if (question.type === "LONG_TEXT") return <textarea rows={3} value={value} onChange={(event) => setValue(event.target.value)} />;
    if (question.type === "BOOLEAN") return <select value={value} onChange={(event) => setValue(event.target.value)}><option value="">Choisir...</option><option value="true">Oui</option><option value="false">Non</option></select>;
    if (question.type === "SINGLE_CHOICE") return <select value={value} onChange={(event) => setValue(event.target.value)}><option value="">Choisir...</option>{question.options.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}</select>;
    if (question.type === "MULTIPLE_CHOICE") return <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Valeurs séparées par des virgules" />;
    if (question.type === "NUMBER") return <input type="number" value={value} onChange={(event) => setValue(event.target.value)} />;
    if (question.type === "DATE") return <input type="date" value={value} onChange={(event) => setValue(event.target.value)} />;
    return <input value={value} onChange={(event) => setValue(event.target.value)} />;
  }

  return <form className="response-field" onSubmit={submit}><label>{control()}</label><div className="response-actions"><button className="button button-secondary" type="submit" disabled={isSubmitting}>{isSubmitting ? "..." : response ? "Mettre à jour" : "Enregistrer"}</button>{response && <button className="button button-quiet" type="button" onClick={() => void onDelete()}>Effacer</button>}</div>{error && <small className="form-error">{error}</small>}</form>;
}