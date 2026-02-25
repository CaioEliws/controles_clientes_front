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
import { useAlterarDataParcela } from "@/hooks/useAlterarDataParcela";
import { useEffect, useRef } from "react";

const schema = z.object({
  novaData: z.string().min(1, "Data obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmprestimo: number;
  numeroParcela: number;
  dataAtual: string;
  onSuccess?: () => Promise<void> | void; 
}

export function AlterarDataParcelaDialog({
  open,
  onOpenChange,
  idEmprestimo,
  numeroParcela,
  dataAtual,
  onSuccess,
}: Props) {
  const { alterarData, loading } = useAlterarDataParcela();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      novaData: dataAtual,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ novaData: dataAtual });
    }
  }, [open, dataAtual, reset]);

  const { ref: registerRef, ...restRegister } = register("novaData");

  const onSubmit = async (data: FormData) => {
    try {
      await alterarData(
        idEmprestimo,
        numeroParcela,
        data.novaData
      );

      await onSuccess?.();
      onOpenChange(false);
    } catch {
      // erro já logado no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-none">
        <DialogHeader>
          <DialogTitle>
            Alterar Data da Parcela #{numeroParcela}
          </DialogTitle>
          <DialogDescription>
            Escolha a nova data de vencimento da parcela.
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
                {...restRegister}
                ref={(el) => {
                  registerRef(el);
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