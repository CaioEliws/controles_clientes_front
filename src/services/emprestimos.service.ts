import { apiClient } from "./apiClient";
import type { EmprestimoDetalhado, ParcelaResponse } from "@/types";

export type FrequenciaPagamento = "DIARIO" | "SEMANAL" | "MENSAL";

export type CriarEmprestimoDTO = {
  valorEmprestado: number;
  quantidadeParcelas: number;
  jurosCobrado: number;
  formaPagamento: string;
  frequenciaPagamento: FrequenciaPagamento;
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
    apiClient.post<void>(`/clientes/${clienteId}/emprestimos`, data),

  refinanciar: (clienteId: number, emprestimoId: number) =>
    apiClient.post<void>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/refinanciar`
    ),

  quitar: (clienteId: number, emprestimoId: number) =>
    apiClient.post<void>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/quitar`
    ),
};