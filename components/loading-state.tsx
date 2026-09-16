export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return <div className="grid min-h-[210px] place-items-center border border-dashed border-line text-center text-sm text-muted"><span className="mr-2 inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-cyan-300" aria-hidden="true" />{label}</div>;
}