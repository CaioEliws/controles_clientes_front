import { apiClient } from "./apiClient";
import type { ParcelaResponse } from "@/types";

export const parcelasService = {
  getVencendoHoje: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/vencendo-hoje"),

  getPorStatus: (status: string) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`),

  getMesAtual: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/mes-atual"),

  pagar: (idEmprestimo: number, numeroParcela: number) =>
    apiClient.post<void>("/parcelas/pagar", {
      idEmprestimo,
      numeroParcela,
    }),

  pagarParcial: (
    idEmprestimo: number,
    numeroParcela: number,
    valorPago: number
  ) =>
    apiClient.post<void>("/parcelas/pagar-parcial", {
      idEmprestimo,
      numeroParcela,
      valorPago,
    }),

  alterarData: (
    idEmprestimo: number,
    numeroParcela: number,
    novaData: string
  ) =>
    apiClient.patch<void>("/parcelas/alterar-data", {
      idEmprestimo,
      numeroParcela,
      novaData,
    }),
};