import { useCallback, useState } from "react";
import { parcelasService } from "@/services/parcelas.service";

export function useAlterarDataParcela() {
  const [loading, setLoading] = useState(false);

  const alterarData = useCallback(
    async (
      idEmprestimo: number,
      numeroParcela: number,
      novaData: string
    ) => {
      try {
        setLoading(true);

        await parcelasService.alterarData(
          idEmprestimo,
          numeroParcela,
          novaData
        );
      } catch (error) {
        console.error("Erro ao alterar data:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { alterarData, loading };
}