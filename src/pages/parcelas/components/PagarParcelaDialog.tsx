import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parcelasService } from "@/services/parcelas.service";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  valorParcela: number;
  onSuccess?: () => Promise<void>;
};

const schema = z.object({
  valorPago: z
    .string()
    .min(1, "Informe um valor")
    .refine((v) => Number(v) > 0, "O valor deve ser maior que zero"),
});

export function PagarParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  valorParcela,
  onSuccess,
}: Props) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      valorPago: String(valorParcela),
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = form;

  const valorDigitado = Number(useWatch({ control, name: "valorPago" }) || "0");

  useEffect(() => {
    if (open) {
      reset({ valorPago: String(valorParcela) });
    }
  }, [open, valorParcela, reset]);

  const pagamentoTotal = Math.abs(valorDigitado - valorParcela) < 0.01;
  const valorMaiorQueSaldo = valorDigitado > valorParcela + 0.01;

  const onSubmit = async (data: { valorPago: string }) => {
    const valorPago = Number(data.valorPago);

    if (valorPago <= 0 || valorMaiorQueSaldo) return;

    try {
      console.log("=== DEBUG PAGAMENTO ===");
      console.log("Emprestimo:", idEmprestimo);
      console.log("Parcela:", numeroParcela);
      console.log("Valor Pago:", valorPago);
      console.log("Valor Parcela:", valorParcela);
      console.log("Pagamento total?", pagamentoTotal);

      if (pagamentoTotal) {
        await parcelasService.pagar(idEmprestimo, numeroParcela);
      } else {
        await parcelasService.pagarParcial(
          idEmprestimo,
          numeroParcela,
          valorPago
        );
      }

      if (onSuccess) {
        await onSuccess();
      }
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Erro completo:", err);

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Erro inesperado ao pagar parcela.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-none">
        <DialogHeader>
          <DialogTitle>Pagar Parcela #{numeroParcela}</DialogTitle>
          <DialogDescription>
            Quanto o cliente está pagando deste saldo?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              Saldo Devedor
            </p>
            <p className="text-2xl font-black text-slate-900">
              {valorParcela.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Valor a Abater
            </label>

            <Input
              type="number"
              step="0.01"
              {...register("valorPago")}
              className="text-lg font-bold"
            />

            {errors.valorPago && (
              <p className="text-xs text-red-600 font-bold">
                {errors.valorPago.message}
              </p>
            )}

            {valorMaiorQueSaldo && (
              <p className="text-xs text-red-600 font-bold">
                Valor excede o saldo!
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                valorDigitado <= 0 ||
                valorMaiorQueSaldo
              }
            >
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}