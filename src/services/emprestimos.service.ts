import { apiClient } from "./apiClient";
import type {
  Emprestimo,
  ParcelaResponse,
} from "@/types";

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
};