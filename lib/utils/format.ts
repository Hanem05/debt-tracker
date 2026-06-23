export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000) return '₱' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return '₱' + (amount / 1_000).toFixed(1) + 'K';
  return '₱' + amount.toFixed(2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}
