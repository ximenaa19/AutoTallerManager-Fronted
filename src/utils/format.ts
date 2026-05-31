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
