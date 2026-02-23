import type { ParcelaResponse } from "@/types";

export interface ParcelaTable {
  idEmprestimo: number;
  numeroParcela: number;
  cliente: string;
  valor: number;
  diasAtraso: number;
  dataVencimento: string;
}

function calcularDiasAtraso(data: string): number {
  const hoje = new Date();
  const vencimento = new Date(data);

  const diff = hoje.getTime() - vencimento.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  return dias > 0 ? dias : 0;
}

export function mapParcelaToTable(
  parcela: ParcelaResponse
): ParcelaTable {
  return {
    idEmprestimo: parcela.idEmprestimo,
    numeroParcela: parcela.numeroParcela,
    cliente: parcela.nomeCliente ?? "Cliente",
    valor: parcela.valorParcela,
    diasAtraso: calcularDiasAtraso(
      parcela.dataVencimento
    ),
    dataVencimento: parcela.dataVencimento,
  };
}