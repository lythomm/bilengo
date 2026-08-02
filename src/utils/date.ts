/**
 * Formate une date au format 'YYYY-MM-DD' ou ISO en date lisible en français.
 * Exemple: '2026-11-25' -> '25 novembre 2026'
 */
export function formatDate(dateInput: string | Date | number): string {
  if (!dateInput) return '';

  const date =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T00:00:00`)
      : new Date(dateInput);

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
