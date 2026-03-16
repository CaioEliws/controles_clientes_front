import { apiClient } from "@/services/apiClient";
import type { ParcelaObservacao } from "@/types/parcela-observacao";

export interface CriarObservacaoPayload {
  idEmprestimo: number;
  numeroParcela: number;
  observacao: string;
}

export interface EditarObservacaoPayload {
  idObservacao: number;
  observacao: string;
}

export const parcelaObservacaoService = {
  listar: async (
    idEmprestimo: number,
    numeroParcela: number
  ): Promise<ParcelaObservacao[]> => {
    return apiClient.get<ParcelaObservacao[]>(
      `/parcelas/observacoes?idEmprestimo=${idEmprestimo}&numeroParcela=${numeroParcela}`
    );
  },

  criar: async (payload: CriarObservacaoPayload): Promise<void> => {
    await apiClient.post<void, CriarObservacaoPayload>(
      "/parcelas/observacoes",
      payload
    );
  },

  editar: async (payload: EditarObservacaoPayload): Promise<void> => {
    await apiClient.patch<void, EditarObservacaoPayload>(
      "/parcelas/observacoes",
      payload
    );
  },

  excluir: async (idObservacao: number): Promise<void> => {
    await apiClient.delete<void>(`/parcelas/observacoes/${idObservacao}`);
  },
};