export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return <div className="loading-state"><span className="loader" aria-hidden="true" />{label}</div>;
}