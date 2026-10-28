import { apiClient } from "./apiClient";
import { ApiError } from "./apiError";

export type ResumoExclusaoPerfil = {
  id: number; nome: string; clientes: number; emprestimos: number; parcelas: number;
  parcelasComPagamento: number; contratosGerados: number; observacoes: number;
};
export function validarResumoExclusao(data: ResumoExclusaoPerfil, id: number): ResumoExclusaoPerfil {
  const contadores = [data?.clientes, data?.emprestimos, data?.parcelas, data?.parcelasComPagamento, data?.contratosGerados, data?.observacoes];
  if (!data || data.id !== id || typeof data.nome !== "string" || !data.nome.trim()
      || contadores.some(valor => !Number.isSafeInteger(valor) || valor < 0))
    throw new ApiError("O resumo recebido não corresponde ao perfil selecionado ou contém contagens inválidas. Consulte novamente.", 0, "RESUMO_PERFIL_INVALIDO", [], "validacao");
  return data;
}
function tratarErroExclusao(error: unknown): never {
  if (error instanceof ApiError && error.status === 404 && (error.codigo === "ENDPOINT_NAO_ENCONTRADO"
      || (!error.codigo && error.resumo === "O recurso solicitado não foi encontrado.")))
    throw new ApiError("A API em execução não disponibiliza esta operação de exclusão de perfil. Atualize ou reinicie o backend e consulte novamente.", 404, "ENDPOINT_NAO_ENCONTRADO", [], "interno");
  throw error;
}
export const perfilExclusaoService = {
  resumo: async (id: number, signal?: AbortSignal) => {
    try {
      const data = await apiClient.get<ResumoExclusaoPerfil>(`/perfis/${id}/resumo-exclusao`, {
        headers: { "X-Perfil-Id": String(id) }, signal,
      });
      return validarResumoExclusao(data, id);
    } catch (error) { tratarErroExclusao(error); }
  },
  excluir: async (id: number, nomeConfirmacao: string) => {
    try {
      await apiClient.delete<void>(`/perfis/${id}`, {
        headers: { "X-Perfil-Id": String(id) }, body: JSON.stringify({ nomeConfirmacao }),
      });
    } catch (error) { tratarErroExclusao(error); }
  },
};
