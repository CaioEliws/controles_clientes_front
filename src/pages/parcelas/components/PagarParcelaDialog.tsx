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
import { parcelasService } from "@/services/parcelas.service";

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
  onSuccess?: () => Promise<void>;
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
  onSuccess,
}: Props) {
  const resolver = useMemo(() => {
    const schema = baseSchema.superRefine((data, ctx) => {
      const pago = parseCurrency(data.valorPago);
      if (pago > valorParcela + 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valorPago"],
          message: "Valor excede o saldo!",
        });
      }
    });

    return zodResolver(schema);
  }, [valorParcela]);

  const form = useForm<FormData>({
    resolver,
    mode: "onChange",
    defaultValues: {
      valorPago: formatCurrency(valorParcela),
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

  const pagamentoTotal = Math.abs(valorDigitado - valorParcela) < 0.01;

  useEffect(() => {
    if (open) reset({ valorPago: formatCurrency(valorParcela) });
  }, [open, valorParcela, reset]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw.trim() === "") {
      setValue("valorPago", "", { shouldValidate: true, shouldDirty: true });
      return;
    }

    const n = parseCurrency(raw);
    setValue("valorPago", formatCurrency(n), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: FormData) => {
    const valorPago = parseCurrency(data.valorPago);

    try {
      if (pagamentoTotal) {
        await parcelasService.pagar(idEmprestimo, numeroParcela);
      } else {
        await parcelasService.pagarParcial(idEmprestimo, numeroParcela, valorPago);
      }

      if (onSuccess) await onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Erro inesperado ao pagar parcela.");
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
              {formatCurrency(valorParcela)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Valor a Abater
            </label>

            <Input
              inputMode="decimal"
              placeholder="R$ 0,00"
              {...register("valorPago")}
              onChange={handleCurrencyChange}
              className="text-lg font-bold"
            />

            {errors.valorPago && (
              <p className="text-xs text-red-600 font-bold">
                {errors.valorPago.message}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}