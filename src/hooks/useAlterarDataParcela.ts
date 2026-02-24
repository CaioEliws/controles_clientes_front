import { useCallback, useState } from "react";
import { parcelasService } from "@/services/parcelas.service";

export function useAlterarDataParcela() {
  const [loading, setLoading] = useState(false);

  const alterarData = useCallback(
    async (
      idEmprestimo: number,
      numeroParcela: number,
      novaData: string,
      onSuccess?: () => void
    ) => {
      try {
        setLoading(true);
        await parcelasService.alterarData(idEmprestimo, numeroParcela, novaData);
        onSuccess?.();
      } catch (error) {
        console.error("Erro ao alterar data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { alterarData, loading };
}