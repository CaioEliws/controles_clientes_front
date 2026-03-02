export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function safeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIsoDateString(value: string | Date | null | undefined): string {
  const d = safeDate(value);
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}