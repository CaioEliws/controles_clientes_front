import { apiClient } from "./apiClient";
import type { Cliente, DadosPessoais, Emprestimo } from "@/types";

export interface ClienteUpdatePayload extends DadosPessoais {
  telefoneWhatsapp?: string | null;
  nome: string;
  nomeIndicador: string | null;
}
export interface ClienteCreatePayload extends ClienteUpdatePayload {
  enderecoRua: string;
  enderecoBairro: string;
  enderecoNumero: number;
}

export const clientesService = {
  getAll: () => apiClient.get<Cliente[]>("/clientes"),

  getById: (clienteId: number) =>
    apiClient.get<Cliente>(`/clientes/${clienteId}`),

  create: (payload: ClienteCreatePayload) =>
    apiClient.post<void, ClienteCreatePayload>("/clientes", payload),

  update: (clienteId: number, payload: ClienteUpdatePayload) =>
    apiClient.put<Cliente, ClienteUpdatePayload>(`/clientes/${clienteId}`, payload),

  getEmprestimos: (clienteId: number) =>
    apiClient.get<Emprestimo[]>(`/clientes/${clienteId}/emprestimos`),

  delete: (clienteId: number) =>
    apiClient.delete<void>(`/clientes/${clienteId}`),
};
