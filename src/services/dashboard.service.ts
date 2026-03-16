import { apiClient } from "@/services/apiClient";
import type { ParcelaResponse, EmprestimoDetalhado } from "@/types";

export const dashboardService = {
  getTotalEmprestado: () =>
    apiClient.get<number>("/dashboard/total-emprestado"),

  getVencendoHoje: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/vencendo-hoje"),

  getParcelasPorStatus: (status: string) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`),

  getEmprestimosPorCliente: (clienteId: number) =>
    apiClient.get<EmprestimoDetalhado[]>(
      `/clientes/${clienteId}/emprestimos/detalhes`
    ),
};