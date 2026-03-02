export function formatCurrency(value: number) {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseCurrency(value: string): number {
  if (!value) return 0;

  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  // ISO date puro (YYYY-MM-DD) sem timezone
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString("pt-BR");
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}