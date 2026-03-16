import { apiClient } from "./apiClient";
import type { Cliente, Emprestimo } from "@/types";

export const clientesService = {
  getAll: () => apiClient.get<Cliente[]>("/clientes"),

  getById: (clienteId: number) =>
    apiClient.get<Cliente>(`/clientes/${clienteId}`),

  getEmprestimos: (clienteId: number) =>
    apiClient.get<Emprestimo[]>(`/clientes/${clienteId}/emprestimos`),

  delete: (clienteId: number) =>
    apiClient.delete<void>(`/clientes/${clienteId}`),
};