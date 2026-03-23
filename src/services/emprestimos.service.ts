import { apiClient } from "./apiClient";
import type { EmprestimoDetalhado, ParcelaResponse } from "@/types";

export type FrequenciaPagamento =
  | "DIARIO"
  | "SEMANAL"
  | "QUINZENAL"
  | "MENSAL";

export type TipoContrato = "FISICO" | "DIGITAL";

export type CriarEmprestimoDTO = {
  valorEmprestado: number;
  quantidadeParcelas: number;
  jurosCobrado: number;
  formaPagamento: string;
  frequenciaPagamento: FrequenciaPagamento;
  tipoContrato: TipoContrato;
};

export type ReprogramarParcelasDTO = {
  novaDataInicial: string;
  novoValorParcela: number;
};

export const emprestimosService = {
  getByCliente: (clienteId: number) =>
    apiClient.get<EmprestimoDetalhado[]>(
      `/clientes/${clienteId}/emprestimos/detalhes`
    ),

  getParcelas: (clienteId: number, emprestimoId: number) =>
    apiClient.get<ParcelaResponse[]>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/parcelas`
    ),

  create: (clienteId: number, data: CriarEmprestimoDTO) =>
    apiClient.post<void, CriarEmprestimoDTO>(
      `/clientes/${clienteId}/emprestimos`,
      data
    ),

  refinanciar: (clienteId: number, emprestimoId: number) =>
    apiClient.post<void>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/refinanciar`
    ),

  quitar: (clienteId: number, emprestimoId: number) =>
    apiClient.post<void>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/quitar`
    ),

  reprogramarParcelas: (
    clienteId: number,
    emprestimoId: number,
    data: ReprogramarParcelasDTO
  ) =>
    apiClient.patch<void, ReprogramarParcelasDTO>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/parcelas/reprogramar`,
      data
    ),

  delete: (clienteId: number, emprestimoId: number) =>
    apiClient.delete<void>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}`
    ),
};