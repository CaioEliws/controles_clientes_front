import { useEffect, useMemo } from "react";
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
import { parcelasService } from "@/services/parcelas/parcelas.service";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { formatCurrency, parseCurrency } from "@/utils/format";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  valorParcela: number;
  valorPago?: number;
  status?: "PENDENTE" | "PARCIAL" | "PAGO" | "ATRASADO";
  onSuccess?: () => Promise<void> | void;
};

const baseSchema = z.object({
  valorPago: z
    .string()
    .trim()
    .min(1, "Informe um valor")
    .refine((v) => parseCurrency(v) > 0, "O valor deve ser maior que zero"),
});

type FormData = z.infer<typeof baseSchema>;

export function PagarParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  valorParcela,
  valorPago = 0,
  onSuccess,
}: Props) {
  const saldoRestante = Math.max(valorParcela - valorPago, 0);
  const temPagamentoParcial = valorPago > 0 && saldoRestante > 0;

  const resolver = useMemo(() => {
    const schema = baseSchema.superRefine((data, ctx) => {
      const valorDigitado = parseCurrency(data.valorPago);

      if (valorDigitado > saldoRestante + 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorPago"],
          message: "Valor excede o saldo restante!",
        });
      }
    });

    return zodResolver(schema);
  }, [saldoRestante]);

  const form = useForm<FormData>({
    resolver,
    mode: "onChange",
    defaultValues: {
      valorPago: formatCurrency(saldoRestante),
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
    control,
  } = form;

  const valorPagoRaw = useWatch({ control, name: "valorPago" }) ?? "";
  const valorDigitado = parseCurrency(valorPagoRaw);
  const pagamentoTotal = Math.abs(valorDigitado - saldoRestante) < 0.01;

  useEffect(() => {
    if (open) {
      reset({
        valorPago: formatCurrency(saldoRestante),
      });
    }
  }, [open, saldoRestante, reset]);

  const valorPagoField = register("valorPago");

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw.trim() === "") {
      setValue("valorPago", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    const onlyDigits = raw.replace(/\D/g, "");

    if (!onlyDigits) {
      setValue("valorPago", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    const numericValue = Number(onlyDigits) / 100;

    setValue("valorPago", formatCurrency(numericValue), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => {
      e.target.select();
    });
  };

  const onSubmit = async (data: FormData) => {
    const valorInformado = parseCurrency(data.valorPago);

    try {
      if (pagamentoTotal) {
        await parcelasService.pagar(idEmprestimo, numeroParcela);
      } else {
        await parcelasService.pagarParcial(
          idEmprestimo,
          numeroParcela,
          valorInformado
        );
      }

      await onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Erro inesperado ao pagar parcela.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-none bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Pagar Parcela #{numeroParcela}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Informe quanto o cliente está pagando deste saldo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {temPagamentoParcial ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">
                  Esta parcela já possui um pagamento parcial registrado.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Valor Total da Parcela
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(valorParcela)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Valor Já Pago
                  </p>
                  <p className="mt-1 text-lg font-semibold text-emerald-600">
                    {formatCurrency(valorPago)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Saldo Restante
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(saldoRestante)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Saldo Devedor
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatCurrency(saldoRestante)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Valor a Abater
            </label>

            <Input
              {...valorPagoField}
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valorPagoRaw}
              onChange={handleCurrencyChange}
              onFocus={handleFocus}
              className="h-12 rounded-xl border-slate-200 text-base font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Digite o valor pago pelo cliente.
              </span>

              {valorPagoRaw && !errors.valorPago && (
                <span className="text-xs font-medium text-slate-600">
                  {pagamentoTotal ? "Pagamento total" : "Pagamento parcial"}
                </span>
              )}
            </div>

            {errors.valorPago && (
              <p className="text-xs font-semibold text-red-600">
                {errors.valorPago.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
              className="font-medium"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="font-medium"
            >
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}