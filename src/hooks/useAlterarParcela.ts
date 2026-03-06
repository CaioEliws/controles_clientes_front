import { useCallback, useState } from "react";
import { parcelasService } from "@/services/parcelas.service";

export function useAlterarParcela() {
  const [loading, setLoading] = useState(false);

  const alterarParcela = useCallback(
    async (
      idEmprestimo: number,
      numeroParcela: number,
      novaData: string,
      novoValor: number
    ) => {
      try {
        setLoading(true);

        await parcelasService.alterarParcela(
          idEmprestimo,
          numeroParcela,
          novaData,
          novoValor
        );
      } catch (error) {
        console.error("Erro ao alterar parcela:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { alterarParcela, loading };
}