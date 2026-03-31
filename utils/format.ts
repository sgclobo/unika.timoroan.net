export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}
