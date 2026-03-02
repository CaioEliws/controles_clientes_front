import type { ParcelaResponse } from "@/types";

export interface ParcelaTable {
  idEmprestimo: number;
  numeroParcela: number;
  cliente: string;
  valor: number;
  diasAtraso: number;
  dataVencimento: string;
}

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

  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function calcularDiasAtraso(data: string | Date | null | undefined): number {
  if (!data) return 0;

  const vencimento = data instanceof Date ? data : new Date(data);
  if (Number.isNaN(vencimento.getTime())) return 0;

  const hoje = new Date();
  const diff = hoje.getTime() - vencimento.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
}

export function mapParcelaToTable(parcela: ParcelaResponse): ParcelaTable {
  const dataFormatada = toIsoDateString(parcela.dataVencimento);

  return {
    idEmprestimo: parcela.idEmprestimo,
    numeroParcela: parcela.numeroParcela,
    cliente: parcela.nomeCliente ?? "Cliente",
    valor: toNumber(parcela.valorParcela),
    diasAtraso: calcularDiasAtraso(parcela.dataVencimento),
    dataVencimento: dataFormatada,
  };
}