import { useState, useEffect, useCallback } from "react";
import type { Cliente } from "@/types";
import { useProfile } from "@/contexts/ProfileContext";
import { clientesService } from "@/services/clientes.service";

export function useClientes() {
  const { perfilAtivo } = useProfile();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmprestimos, setTotalEmprestimos] = useState(0);

  const [erro, setErro] = useState<string | null>(null);

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
      setErro(null);
      setLoading(true);

      const data = await clientesService.getAll();
      setClientes(data);

      const total = data.reduce((acc, cliente) => acc + (cliente.quantidadeEmprestimos ?? 0), 0);

      setTotalEmprestimos(total);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      clearState();
      setErro(error instanceof Error ? error.message : "Não foi possível carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, [perfilAtivo, clearState]);

  const deletarCliente = useCallback(
    async (id: number) => {
      if (!perfilAtivo) {
        throw new Error("Nenhum perfil selecionado.");
      }

      await clientesService.delete(id);
      await fetchClientes();
    },
    [perfilAtivo, fetchClientes]
  );

  useEffect(() => {
    void fetchClientes();
  }, [fetchClientes]);

  return { erro, clientes, loading, totalEmprestimos, fetchClientes, deletarCliente };
}
