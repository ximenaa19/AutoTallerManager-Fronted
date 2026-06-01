export function formatCurrency(value: number | undefined | null): string {
  const safeValue = value ?? 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function formatNumber(value: number | undefined | null): string {
  const safeValue = value ?? 0;
  return new Intl.NumberFormat('en-US').format(safeValue);
}

export function formatDateTime(value: string | undefined | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
