import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

import { useEmprestimo } from "@/hooks/useEmprestimo";

type Props = {
  disabled?: boolean;
  selectedClienteId: number | null;
  selectedClienteName?: string | null;
  onCreated?: () => void;
};

export function NovoEmprestimoDialog({
  disabled,
  selectedClienteId,
  selectedClienteName,
  onCreated,
}: Props) {
  const form = useEmprestimo();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!selectedClienteId) return;

    form.setValue("clienteId", String(selectedClienteId), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [open, selectedClienteId, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await form.onSubmit(values);

    onCreated?.();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Criar Empréstimo
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">Novo Empréstimo</DialogTitle>
          <DialogDescription>
            O empréstimo será criado para o cliente selecionado na página.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm">Cliente</Label>
            <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center text-sm text-slate-900">
              {selectedClienteName ?? "—"}
            </div>
            <p className="text-xs text-slate-500">
              Para trocar o cliente, selecione outro no topo da página.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Valor emprestado</Label>
              <Input
                placeholder="Ex: 3000"
                inputMode="decimal"
                {...form.register("valorEmprestado")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Quantidade de parcelas</Label>
              <Input
                placeholder="Ex: 6"
                inputMode="numeric"
                {...form.register("quantidadeParcelas")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Juros (%)</Label>
              <Input
                placeholder="Ex: 12"
                inputMode="decimal"
                {...form.register("jurosCobrado")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Forma de pagamento</Label>
              <select
                {...form.register("formaPagamento")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione a forma
                </option>

                <option value="PIX">PIX</option>
                <option value="DINHEIRO">DINHEIRO</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" className="gap-2" disabled={!selectedClienteId}>
              <PlusCircle className="w-4 h-4" />
              Criar empréstimo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}