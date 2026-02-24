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
import { useRef } from "react";

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
  onSuccess: () => void;
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      novaData: dataAtual,
    },
  });

  const { ref: registerRef, ...restRegister } = register("novaData");

  const onSubmit = async (data: FormData) => {
    await alterarData(idEmprestimo, numeroParcela, data.novaData, () => {
      onSuccess();
      onOpenChange(false);
    });
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
                className="
                  text-lg font-medium pr-12
                  [&::-webkit-calendar-picker-indicator]:opacity-0
                "
              />

              <button
                type="button"
                onClick={() => inputRef.current?.showPicker()}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {errors.novaData && (
              <p className="text-xs text-red-600 font-bold">
                {errors.novaData.message}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
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