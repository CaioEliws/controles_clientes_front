import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/services/apiClient";
import type { ParcelaResponse, StatusParcela } from "@/types";

export function useParcelas() {
  const [parcelas, setParcelas] = useState<ParcelaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusParcela | "ALL">("ALL");

  const fetchParcelas = useCallback(async () => {
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
            apiClient.get<ParcelaResponse[]>(
              `/parcelas?status=${s}`
            )
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
    } finally {
      setLoading(false);
    }
  }, [status]);

  const pagarParcela = useCallback(
    async (idEmprestimo: number, numeroParcela: number) => {
      await apiClient.post("/parcelas/pagar", {
        idEmprestimo,
        numeroParcela,
      });

      await fetchParcelas();
    },
    [fetchParcelas]
  );

  useEffect(() => {
    fetchParcelas();
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