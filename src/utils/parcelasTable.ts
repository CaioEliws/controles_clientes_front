import type { StatusParcela } from "@/types";

export function toNumberCurrency(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getParcelaStatusBadgeClassName(status: StatusParcela) {
  switch (status) {
    case "PAGO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
    case "ATRASADO":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50";
    case "PARCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50";
    case "PENDENTE":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50";
  }
}