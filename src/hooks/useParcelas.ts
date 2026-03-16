import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/services/apiClient";
import type { ParcelaResponse, StatusParcela } from "@/types";
import { useProfile } from "@/contexts/ProfileContext";

export function useParcelas() {
  const { perfilAtivo } = useProfile();

  const [parcelas, setParcelas] = useState<ParcelaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusParcela | "ALL">("ALL");

  const clearState = useCallback(() => {
    setParcelas([]);
    setLoading(false);
  }, []);

  const fetchParcelas = useCallback(async () => {
    if (!perfilAtivo) {
      clearState();
      return;
    }

    try {
      setLoading(true);

      if (status === "ALL") {
        const statuses: StatusParcela[] = [
          "PENDENTE",
          "PARCIAL",
          "PAGO",
          "ATRASADO",
        ];

        const results = await Promise.all(
          statuses.map((s) =>
            apiClient.get<ParcelaResponse[]>(`/parcelas?status=${s}`)
          )
        );

        setParcelas(results.flat());
      } else {
        const data = await apiClient.get<ParcelaResponse[]>(
          `/parcelas?status=${status}`
        );

        setParcelas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error);
      clearState();
    } finally {
      setLoading(false);
    }
  }, [status, perfilAtivo, clearState]);

  const pagarParcela = useCallback(
    async (idEmprestimo: number, numeroParcela: number) => {
      if (!perfilAtivo) {
        throw new Error("Nenhum perfil selecionado.");
      }

      await apiClient.post("/parcelas/pagar", {
        idEmprestimo,
        numeroParcela,
      });

      await fetchParcelas();
    },
    [fetchParcelas, perfilAtivo]
  );

  useEffect(() => {
    void fetchParcelas();
  }, [fetchParcelas]);

  return {
    parcelas,
    loading,
    status,
    setStatus,
    fetchParcelas,
    pagarParcela,
  };
}