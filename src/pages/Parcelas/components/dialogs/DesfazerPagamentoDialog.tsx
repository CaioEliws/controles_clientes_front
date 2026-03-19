import { useState } from "react";
import { apiClient } from "@/services/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DesfazerPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  onSuccess: () => void;
}

export function DesfazerPagamentoDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  onSuccess,
}: DesfazerPagamentoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      await apiClient.post("/parcelas/desfazer-pagamento", {
        idEmprestimo,
        numeroParcela,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao desfazer pagamento da parcela.";

      alert(message);
      console.error("Erro ao desfazer pagamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Desfazer pagamento da parcela</DialogTitle>
          <DialogDescription>
            Esta ação vai remover o pagamento registrado desta parcela. Depois
            disso, a tela de edição será aberta para você ajustar a data correta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">Empréstimo</p>
            <p className="font-semibold text-slate-900">#{idEmprestimo}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">Parcela</p>
            <p className="font-semibold text-slate-900">#{numeroParcela}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Use esta opção apenas quando a parcela foi marcada como paga por
            engano. Após desfazer, você poderá corrigir a data imediatamente.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Desfazendo..." : "Desfazer e continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}