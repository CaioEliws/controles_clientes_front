import { apiClient } from "./apiClient";
import type {
  Emprestimo,
  ParcelaResponse,
} from "@/types";

export interface CriarEmprestimoDTO {
  valorEmprestado: number;
  quantidadeParcelas: number;
  jurosCobrado: number;
  formaPagamento: string;
}

export const emprestimosService = {
  getByCliente: (clienteId: number) =>
    apiClient.get<Emprestimo[]>(
      `/clientes/${clienteId}/emprestimos`
    ),

  getParcelas: (
    clienteId: number,
    emprestimoId: number
  ) =>
    apiClient.get<ParcelaResponse[]>(
      `/clientes/${clienteId}/emprestimos/${emprestimoId}/parcelas`
    ),

  create: (
    clienteId: number,
    data: CriarEmprestimoDTO
  ) =>
    apiClient.post<void>(
      `/clientes/${clienteId}/emprestimos`,
      data
    ),
};