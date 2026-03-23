import { useCallback, useMemo, useState } from "react";
import { emprestimosService } from "@/services/emprestimos.service";
import type { EmprestimoDetalhado } from "@/types";

export type ActionType = "REFINANCIAR" | "QUITAR" | "DELETAR";

type Props = {
  selectedClienteId?: number | null;
  onRefetch?: () => void;
};

export function useEmprestimoStatusActions({
  selectedClienteId,
  onRefetch,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<EmprestimoDetalhado | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const [loadingRefinance, setLoadingRefinance] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const canAct = useMemo(() => Boolean(selectedClienteId), [selectedClienteId]);

  const close = useCallback(() => {
    setIsOpen(false);
    setTarget(null);
    setActionType(null);
  }, []);

  const openRefinance = useCallback((e: EmprestimoDetalhado) => {
    setTarget(e);
    setActionType("REFINANCIAR");
    setIsOpen(true);
  }, []);

  const openQuit = useCallback((e: EmprestimoDetalhado) => {
    setTarget(e);
    setActionType("QUITAR");
    setIsOpen(true);
  }, []);

  const openDelete = useCallback((e: EmprestimoDetalhado) => {
    setTarget(e);
    setActionType("DELETAR");
    setIsOpen(true);
  }, []);

  const handleRefinance = useCallback(async () => {
    if (!selectedClienteId || !target) return;

    try {
      setLoadingRefinance(true);
      await emprestimosService.refinanciar(selectedClienteId, target.id);
      onRefetch?.();
      close();
    } finally {
      setLoadingRefinance(false);
    }
  }, [selectedClienteId, target, onRefetch, close]);

  const handleQuit = useCallback(async () => {
    if (!selectedClienteId || !target) return;

    try {
      setLoadingQuit(true);
      await emprestimosService.quitar(selectedClienteId, target.id);
      onRefetch?.();
      close();
    } finally {
      setLoadingQuit(false);
    }
  }, [selectedClienteId, target, onRefetch, close]);

  const handleDelete = useCallback(async () => {
    if (!selectedClienteId || !target) return;

    try {
      setLoadingDelete(true);
      await emprestimosService.delete(selectedClienteId, target.id);
      onRefetch?.();
      close();
    } finally {
      setLoadingDelete(false);
    }
  }, [selectedClienteId, target, onRefetch, close]);

  const confirm = useCallback(async () => {
    if (actionType === "REFINANCIAR") {
      await handleRefinance();
      return;
    }

    if (actionType === "QUITAR") {
      await handleQuit();
      return;
    }

    if (actionType === "DELETAR") {
      await handleDelete();
    }
  }, [actionType, handleRefinance, handleQuit, handleDelete]);

  return {
    isOpen,
    target,
    actionType,
    openRefinance,
    openQuit,
    openDelete,
    close,
    confirm,
    loadingRefinance,
    loadingQuit,
    loadingDelete,
    canAct,
  };
}