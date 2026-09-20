import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  options?: { full?: boolean }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";

  if (options?.full) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, "");
    return `${sign}₹${formatted} Cr`;
  }

  if (abs >= 100000) {
    const lac = abs / 100000;
    const formatted = lac % 1 === 0 ? lac.toFixed(0) : lac.toFixed(2).replace(/\.?0+$/, "");
    return `${sign}₹${formatted} L`;
  }

  return `${sign}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatFullINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(number: number): string {
  const abs = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  if (abs >= 10000000) {
    return `${sign}${(abs / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${(abs / 100000).toFixed(1).replace(/\.0$/, "")} L`;
  }
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(1).replace(/\.0$/, "")} k`;
  }
  return `${sign}${abs.toString()}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

