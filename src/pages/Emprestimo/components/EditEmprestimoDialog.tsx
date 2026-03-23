import { useEffect, useRef, useState } from "react";
import type { EmprestimoDetalhado } from "@/types";
import type { ReprogramarParcelasDTO } from "@/services/emprestimos.service";
import { formatCurrency, formatDate, parseCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  loading?: boolean;
  emprestimo: EmprestimoDetalhado | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ReprogramarParcelasDTO) => Promise<void>;

  onQuit?: () => void;
  onRefinance?: () => void;
  onDelete?: () => void;

  loadingQuit?: boolean;
  loadingRefinance?: boolean;
  loadingDelete?: boolean;
  actionsDisabled?: boolean;
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatEmprestimoStatus(status?: string | null) {
  switch (status) {
    case "EM_ABERTO":
      return "Em aberto";
    case "QUITADO":
      return "Quitado";
    case "REFINANCIADO":
      return "Refinanciado";
    default:
      return status ?? "-";
  }
}

export function EditEmprestimoDialog({
  open,
  loading,
  emprestimo,
  onOpenChange,
  onSubmit,
  onQuit,
  onRefinance,
  onDelete,
  loadingQuit,
  loadingRefinance,
  loadingDelete,
  actionsDisabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [novaDataInicial, setNovaDataInicial] = useState("");
  const [novoValorParcela, setNovoValorParcela] = useState("");

  useEffect(() => {
    if (!emprestimo || !open) return;

    setNovaDataInicial(toInputDate(emprestimo.inicioPagamento));
    setNovoValorParcela(formatCurrency(emprestimo.valorParcela));
  }, [emprestimo, open]);

  async function handleSubmit() {
    if (!novaDataInicial || !novoValorParcela || loading) return;

    await onSubmit({
      novaDataInicial,
      novoValorParcela: parseCurrency(novoValorParcela),
    });
  }

  const isStatusEmAberto = emprestimo?.status === "EM_ABERTO";
  const isAnyActionLoading =
    !!loading || !!loadingQuit || !!loadingRefinance || !!loadingDelete;
  const disableLoanActions = !!actionsDisabled || isAnyActionLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-none bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reprogramar parcelas do empréstimo</DialogTitle>
          <DialogDescription>
            Escolha a nova data base e o novo valor das parcelas em aberto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nova Data Inicial
            </label>

            <div className="relative">
              <Input
                ref={inputRef}
                type="date"
                value={novaDataInicial}
                onChange={(e) => setNovaDataInicial(e.target.value)}
                disabled={isAnyActionLoading}
                className="pr-12 text-lg font-medium [&::-webkit-calendar-picker-indicator]:opacity-0"
              />

              <button
                type="button"
                onClick={() =>
                  (
                    inputRef.current as
                      | (HTMLInputElement & { showPicker?: () => void })
                      | null
                  )?.showPicker?.()
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
                disabled={isAnyActionLoading}
              >
                📅
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Novo Valor da Parcela
            </label>

            <Input
              type="text"
              inputMode="numeric"
              value={novoValorParcela}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const numericValue = Number(raw) / 100;

                setNovoValorParcela(formatCurrency(numericValue));
              }}
              disabled={isAnyActionLoading}
              className="text-lg font-medium"
              placeholder="Ex.: 150,00"
            />
          </div>

          {emprestimo && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Cliente
                  </p>
                  <p className="font-semibold text-slate-700">
                    {emprestimo.nomeCliente}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="font-semibold text-slate-700">
                    {formatEmprestimoStatus(String(emprestimo.status))}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Início atual
                  </p>
                  <p className="font-semibold text-slate-700">
                    {formatDate(emprestimo.inicioPagamento)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Valor atual da parcela
                  </p>
                  <p className="font-semibold text-slate-700">
                    {formatCurrency(emprestimo.valorParcela)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {emprestimo && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 space-y-1">
                <p className="text-sm font-semibold text-slate-700">
                  Ações do empréstimo
                </p>
                <p className="text-xs text-slate-500">
                  Gerencie o status do empréstimo por aqui.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {isStatusEmAberto && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRefinance}
                      disabled={disableLoanActions || !onRefinance}
                      className="sm:flex-1"
                    >
                      {loadingRefinance ? "Refinanciando..." : "Refinanciar"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={onQuit}
                      disabled={disableLoanActions || !onQuit}
                      className="sm:flex-1"
                    >
                      {loadingQuit ? "Quitando..." : "Quitar"}
                    </Button>
                  </>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={disableLoanActions || !onDelete}
                  className="sm:flex-1"
                >
                  {loadingDelete ? "Excluindo..." : "Excluir empréstimo"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isAnyActionLoading}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isAnyActionLoading || !novaDataInicial || !novoValorParcela}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}