import { format, formatDistanceToNow, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy");
}

export function formatDateShort(timestamp: number): string {
  return format(new Date(timestamp), "MMM d");
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), "h:mm a");
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function getMonthRange(date: Date = new Date()) {
  return {
    startDate: startOfMonth(date).getTime(),
    endDate: endOfMonth(date).getTime(),
  };
}

export function getPreviousMonthRange(date: Date = new Date()) {
  const prev = subMonths(date, 1);
  return {
    startDate: startOfMonth(prev).getTime(),
    endDate: endOfMonth(prev).getTime(),
  };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function groupByDate<T extends { date: number }>(
  items: T[]
): { date: string; items: T[] }[] {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const key = format(new Date(item.date), "yyyy-MM-dd");
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date: format(new Date(date), "EEEE, MMM d"),
      items,
    }));
}
