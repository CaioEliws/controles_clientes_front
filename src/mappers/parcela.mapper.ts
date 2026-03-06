import type { ParcelaResponse } from "@/types";

export type ParcelaTable = {
  idEmprestimo: number;
  numeroParcela: number;
  cliente: string;
  valor: number;
  valorPago: number;
  status: "PENDENTE" | "PARCIAL" | "PAGO" | "ATRASADO";
  dataVencimento: string;
};

function toIsoDateString(value: string | Date | null | undefined): string {
  if (!value) return "";

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().slice(0, 10);
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value.trim().replace(/\./g, "").replace(",", ".");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function mapParcelaToTable(parcela: ParcelaResponse): ParcelaTable {
  return {
    idEmprestimo: parcela.idEmprestimo,
    numeroParcela: parcela.numeroParcela,
    cliente: parcela.nomeCliente ?? "Cliente",
    valor: toNumber(parcela.valorParcela),
    valorPago: toNumber(parcela.valorPago),
    status: parcela.status,
    dataVencimento: toIsoDateString(parcela.dataVencimento),
  };
}