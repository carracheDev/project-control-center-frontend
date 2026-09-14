export function formatDate(date: string | null | undefined) {
  if (!date) return "Non définie";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}