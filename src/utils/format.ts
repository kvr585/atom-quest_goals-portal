import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatRelative(date: string) {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
