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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlterarParcela } from "@/hooks/useAlterarParcela";
import { useEffect, useRef } from "react";
import { formatCurrency, parseCurrency } from "@/utils/format";

const schema = z.object({
  novaData: z.string().min(1, "Data obrigatória"),
  novoValor: z
    .string()
    .min(1, "Valor obrigatório")
    .refine((value) => parseCurrency(value) > 0, "Valor deve ser maior que zero"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  dataAtual: string;
  valorAtual: number;
  onSuccess?: () => Promise<void> | void;
}

export function AlterarParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  dataAtual,
  valorAtual,
  onSuccess,
}: Props) {
  const { alterarParcela, loading } = useAlterarParcela();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      novaData: dataAtual,
      novoValor: formatCurrency(valorAtual),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        novaData: dataAtual,
        novoValor: formatCurrency(valorAtual),
      });
    }
  }, [open, dataAtual, valorAtual, reset]);

  const { ref: registerDataRef, ...restDataRegister } = register("novaData");
  const valorRegistrado = register("novoValor");
  // eslint-disable-next-line react-hooks/incompatible-library
  const valorAtualInput = watch("novoValor");

  const onSubmit = async (data: FormData) => {
    try {
      await alterarParcela(
        idEmprestimo,
        numeroParcela,
        data.novaData,
        parseCurrency(data.novoValor)
      );

      await onSuccess?.();
      onOpenChange(false);
    } catch {
      // erro já tratado no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-none">
        <DialogHeader>
          <DialogTitle>Alterar Parcela #{numeroParcela}</DialogTitle>
          <DialogDescription>
            Escolha a nova data de vencimento e o novo valor da parcela.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nova Data
            </label>

            <div className="relative">
              <Input
                type="date"
                {...restDataRegister}
                ref={(el) => {
                  registerDataRef(el);
                  inputRef.current = el;
                }}
                className="text-lg font-medium pr-12 [&::-webkit-calendar-picker-indicator]:opacity-0"
              />

              <button
                type="button"
                onClick={() => inputRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                📅
              </button>
            </div>

            {errors.novaData && (
              <p className="text-xs text-red-600 font-bold">
                {errors.novaData.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Novo Valor
            </label>

            <Input
              type="text"
              inputMode="numeric"
              value={valorAtualInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const numericValue = Number(raw) / 100;
                setValue("novoValor", formatCurrency(numericValue), {
                  shouldValidate: true,
                });
              }}
              onBlur={valorRegistrado.onBlur}
              name={valorRegistrado.name}
              ref={valorRegistrado.ref}
              className="text-lg font-medium"
            />

            {errors.novoValor && (
              <p className="text-xs text-red-600 font-bold">
                {errors.novoValor.message}
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

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}