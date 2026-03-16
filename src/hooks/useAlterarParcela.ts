import { useCallback, useState } from "react";
import { parcelasService } from "@/services/parcelas.service";
import { useProfile } from "@/contexts/ProfileContext";

export function useAlterarParcela() {
  const { perfilAtivo } = useProfile();
  const [loading, setLoading] = useState(false);

  const alterarParcela = useCallback(
    async (
      idEmprestimo: number,
      numeroParcela: number,
      novaData: string,
      novoValor: number
    ) => {
      if (!perfilAtivo) {
        throw new Error("Nenhum perfil selecionado.");
      }

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
    [perfilAtivo]
  );

  return { alterarParcela, loading };
}