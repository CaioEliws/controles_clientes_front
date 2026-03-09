import { apiClient } from "./apiClient";
import type { Relatorio, Emprestimo, ParcelaResponse } from "@/types";

function safeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function buscarRelatorioCliente(
  clienteId: number
): Promise<Relatorio> {
  const emprestimos = await apiClient.get<Emprestimo[]>(
    `/clientes/${clienteId}/emprestimos`
  );

  const parcelasArrays = await Promise.all(
    emprestimos.map((emp) =>
      apiClient.get<ParcelaResponse[]>(
        `/clientes/${clienteId}/emprestimos/${emp.id}/parcelas`
      )
    )
  );

  const parcelas = parcelasArrays.flat();
  const agora = new Date();

  return {
    totalEmprestado: emprestimos.reduce(
      (acc, e) => acc + (e.valorTotalEmprestimo ?? 0),
      0
    ),
    totalPago: emprestimos.reduce(
      (acc, e) => acc + (e.valorRecebido ?? 0),
      0
    ),
    totalAberto: emprestimos.reduce(
      (acc, e) => acc + (e.valorAReceber ?? 0),
      0
    ),
    totalEmprestimos: emprestimos.length,
    totalParcelas: parcelas.length,
    parcelasPagas: parcelas.filter((p) => p.status === "PAGO").length,
    parcelasAtrasadas: parcelas.filter((p) => p.status === "ATRASADO").length,
    parcelasAVencer: parcelas.filter((p) => {
      if (p.status !== "PENDENTE") return false;

      const venc = safeDate(p.dataVencimento);
      if (!venc) return false;

      return venc >= agora;
    }).length,
  };
}