"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Supprimer définitivement", isSubmitting = false, onCancel, onConfirm }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-brand-950/35 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,.2)]" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title"><p className="text-xs font-bold uppercase tracking-[.14em] text-danger">Action irréversible</p><h2 id="confirm-dialog-title" className="mt-2 font-display text-xl font-semibold text-ink">{title}</h2><p className="mt-3 text-sm leading-6 text-muted">{description}</p><div className="mt-6 flex justify-end gap-3"><button ref={cancelRef} className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-900 hover:bg-brand-900 hover:text-white" type="button" onClick={onCancel} disabled={isSubmitting}>Annuler</button><button className="rounded-lg border border-danger bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-red-700 hover:bg-red-700 disabled:opacity-60" type="button" onClick={onConfirm} disabled={isSubmitting}>{isSubmitting ? "Suppression..." : confirmLabel}</button></div></div></div>;
}
