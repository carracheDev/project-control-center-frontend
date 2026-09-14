export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return <div className="grid min-h-[210px] place-items-center border border-dashed border-[#cbd6d1] text-center text-sm text-[var(--muted)]"><span className="mr-2 inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#c5d6d0] border-t-[var(--teal)]" aria-hidden="true" />{label}</div>;
}