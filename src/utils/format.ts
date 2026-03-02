export function formatCurrency(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }

  let numberValue: number;

  if (typeof value === "number") {
    numberValue = value;
  } else if (typeof value === "string") {
    const cleaned = value
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    numberValue = Number(cleaned);
  } else {
    numberValue = Number(value);
  }

  if (!Number.isFinite(numberValue)) {
    return "R$ 0,00";
  }

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;

  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "-";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString("pt-BR");
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR");
}