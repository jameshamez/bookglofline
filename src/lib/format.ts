import { format } from "date-fns";
import { th } from "date-fns/locale";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTeeTime(date: Date) {
  return format(date, "EEE d MMM yyyy • HH:mm", { locale: th });
}

export function formatDateBadge(date: Date) {
  return format(date, "EEEE d MMMM", { locale: th });
}

export function bookingCodePrefix(courseName: string) {
  return courseName
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "G");
}
