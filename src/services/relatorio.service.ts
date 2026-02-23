import type { Relatorio, Emprestimo, ParcelaResponse } from "@/types";

export async function buscarRelatorioCliente(
  API: string,
  clienteId: number
): Promise<Relatorio> {
  const emprestimos: Emprestimo[] = await fetch(
    `${API}/clientes/${clienteId}/emprestimos`
  ).then((r) => r.json());

  const parcelasArrays = await Promise.all(
    emprestimos.map((emp) =>
      fetch(
        `${API}/clientes/${clienteId}/emprestimos/${emp.id}/parcelas`
      ).then((r) => r.json() as Promise<ParcelaResponse[]>)
    )
  );

  const parcelas = parcelasArrays.flat();

  return {
    totalEmprestado: emprestimos.reduce(
      (acc, e) => acc + e.valorEmprestado,
      0
    ),
    totalPago: emprestimos.reduce(
      (acc, e) => acc + e.valorRecebido,
      0
    ),
    totalAberto: emprestimos.reduce(
      (acc, e) => acc + (e.valorAReceber - e.valorRecebido),
      0
    ),
    totalEmprestimos: emprestimos.length,
    totalParcelas: parcelas.length,
    parcelasPagas: parcelas.filter((p) => p.status === "PAGO").length,
    parcelasAtrasadas: parcelas.filter(
      (p) => p.status === "ATRASADO"
    ).length,
    parcelasAVencer: parcelas.filter(
      (p) =>
        p.status === "PENDENTE" &&
        new Date(p.dataVencimento) >= new Date()
    ).length,
  };
}