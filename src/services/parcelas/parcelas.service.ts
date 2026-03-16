import { apiClient } from "@/services/apiClient";
import type { ParcelaResponse, StatusParcela } from "@/types";
import type { ParcelaObservacao } from "@/types/parcela-observacao";

export const parcelasService = {
  getVencendoHoje: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/vencendo-hoje"),

  getPorStatus: (status: StatusParcela) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`),

  getMesAtual: () =>
    apiClient.get<ParcelaResponse[]>("/parcelas/mes-atual"),

  getByEmprestimo: (idEmprestimo: number) =>
    apiClient.get<ParcelaResponse[]>(`/parcelas/emprestimo/${idEmprestimo}`),

  pagar: (idEmprestimo: number, numeroParcela: number) =>
    apiClient.post<void, { idEmprestimo: number; numeroParcela: number }>(
      "/parcelas/pagar",
      {
        idEmprestimo,
        numeroParcela,
      }
    ),

  pagarParcial: (
    idEmprestimo: number,
    numeroParcela: number,
    valorPago: number
  ) =>
    apiClient.post<
      void,
      { idEmprestimo: number; numeroParcela: number; valorPago: number }
    >("/parcelas/pagar-parcial", {
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
    apiClient.patch<
      void,
      {
        idEmprestimo: number;
        numeroParcela: number;
        novaData: string;
        novoValor: number;
      }
    >("/parcelas/alterar", {
      idEmprestimo,
      numeroParcela,
      novaData,
      novoValor,
    }),

  listarObservacoes: (idEmprestimo: number, numeroParcela: number) =>
    apiClient.get<ParcelaObservacao[]>(
      `/parcelas/observacoes?idEmprestimo=${idEmprestimo}&numeroParcela=${numeroParcela}`
    ),

  criarObservacao: (
    idEmprestimo: number,
    numeroParcela: number,
    observacao: string
  ) =>
    apiClient.post<
      void,
      {
        idEmprestimo: number;
        numeroParcela: number;
        observacao: string;
      }
    >("/parcelas/observacoes", {
      idEmprestimo,
      numeroParcela,
      observacao,
    }),

  editarObservacao: (idObservacao: number, observacao: string) =>
    apiClient.patch<
      void,
      {
        idObservacao: number;
        observacao: string;
      }
    >("/parcelas/observacoes", {
      idObservacao,
      observacao,
    }),

  excluirObservacao: (idObservacao: number) =>
    apiClient.delete<void>(`/parcelas/observacoes/${idObservacao}`),
};