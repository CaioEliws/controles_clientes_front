import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/services/apiClient";
import type { Cliente, Emprestimo } from "@/types";
import { useProfile } from "@/contexts/ProfileContext";

export function useClientes() {
  const { perfilAtivo } = useProfile();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmprestimos, setTotalEmprestimos] = useState(0);

  const clearState = useCallback(() => {
    setClientes([]);
    setTotalEmprestimos(0);
    setLoading(false);
  }, []);

  const fetchClientes = useCallback(async () => {
    if (!perfilAtivo) {
      clearState();
      return;
    }

    try {
      setLoading(true);

      const data = await apiClient.get<Cliente[]>("/clientes");
      setClientes(data);

      const emprestimosPorCliente = await Promise.all(
        data.map((cliente) =>
          apiClient
            .get<Emprestimo[]>(`/clientes/${cliente.id}/emprestimos`)
            .catch(() => [] as Emprestimo[])
        )
      );

      const total = emprestimosPorCliente.reduce(
        (acc, emprestimos) => acc + emprestimos.length,
        0
      );

      setTotalEmprestimos(total);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      clearState();
    } finally {
      setLoading(false);
    }
  }, [perfilAtivo, clearState]);

  const deletarCliente = useCallback(
    async (id: number) => {
      if (!perfilAtivo) {
        throw new Error("Nenhum perfil selecionado.");
      }

      if (!window.confirm("Deseja realmente deletar?")) return;

      await apiClient.delete(`/clientes/${id}`);
      await fetchClientes();
    },
    [perfilAtivo, fetchClientes]
  );

  useEffect(() => {
    void fetchClientes();
  }, [fetchClientes]);

  return { clientes, loading, totalEmprestimos, fetchClientes, deletarCliente };
}