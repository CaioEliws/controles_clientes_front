import { useState } from "react";
import type { EmprestimoDetalhado } from "@/types";
import { emprestimosService } from "@/services/emprestimos.service";

type ActionType = "REFINANCIAR" | "QUITAR";

type Params = {
  selectedClienteId?: number | null;
  onRefetch?: () => void;
};

export function useEmprestimoStatusActions({ selectedClienteId, onRefetch }: Params) {
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [target, setTarget] = useState<EmprestimoDetalhado | null>(null);

  const [loadingRefinance, setLoadingRefinance] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);

  const openRefinance = (e: EmprestimoDetalhado) => {
    setTarget(e);
    setActionType("REFINANCIAR");
  };

  const openQuit = (e: EmprestimoDetalhado) => {
    setTarget(e);
    setActionType("QUITAR");
  };

  const close = () => {
    setTarget(null);
    setActionType(null);
  };

  const isOpen = !!target && !!actionType;

  async function confirm() {
    if (!selectedClienteId || !target || !actionType) return;

    try {
      if (actionType === "REFINANCIAR") {
        setLoadingRefinance(true);
        await emprestimosService.refinanciar(selectedClienteId, target.id);
      } else {
        setLoadingQuit(true);
        await emprestimosService.quitar(selectedClienteId, target.id);
      }

      close();
      await onRefetch?.();
    } catch (err) {
      console.error(err);
      alert(
        actionType === "REFINANCIAR"
          ? "Erro ao refinanciar empréstimo."
          : "Erro ao quitar empréstimo."
      );
    } finally {
      setLoadingRefinance(false);
      setLoadingQuit(false);
    }
  }

  return {
    isOpen,
    target,
    actionType,
    openRefinance,
    openQuit,
    close,
    confirm,
    loadingRefinance,
    loadingQuit,
    canAct: !!selectedClienteId,
  };
}