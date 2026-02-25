import { apiClient } from "./apiClient";
import type { Cliente } from "@/types";

export const clientesService = {
  getAll: () => apiClient.get<Cliente[]>("/clientes"),
};