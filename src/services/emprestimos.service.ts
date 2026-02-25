import { apiClient } from "./apiClient";
import type { EmprestimoDetalhado, ParcelaResponse } from "@/types";

export interface CriarEmprestimoDTO {
  valorEmprestado: number;
  quantidadeParcelas: number;
  jurosCobrado: number;
  formaPagamento: string;
}

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
};