import { apiClient } from "./apiClient";
import type { ParcelaResponse } from "@/types";

export const parcelasService = {
  getVencendoHoje: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/vencendo-hoje"),

  getPorStatus: (status: string) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`),

  getMesAtual: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/mes-atual"),

  getByEmprestimo: (idEmprestimo: number) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas/emprestimo/${idEmprestimo}`),

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

  alterarParcela: (
    idEmprestimo: number,
    numeroParcela: number,
    novaData: string,
    novoValor: number
  ) =>
    apiClient.patch<void>("/parcelas/alterar", {
      idEmprestimo,
      numeroParcela,
      novaData,
      novoValor,
    }),
};