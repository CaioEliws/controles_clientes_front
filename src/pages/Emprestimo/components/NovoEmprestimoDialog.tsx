import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { FiadorSelector } from "./FiadorSelector";
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
import { cn } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente } from "@/types";
import { ModalCadastro } from "@/components/ModalCadastro";

type Props = {
  clientes: Cliente[];
  onClienteCreated: () => Promise<void>;
  disabled?: boolean;
  selectedClienteId: number | null;
  selectedClienteName?: string | null;
  onCreated?: () => void;
  triggerClassName?: string;
};

export function NovoEmprestimoDialog({
  clientes,
  onClienteCreated,
  disabled,
  selectedClienteId,
  selectedClienteName,
  onCreated,
  triggerClassName,
}: Props) {
  const form = useEmprestimo(clientes);
  const { perfilAtivo } = useProfile();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoCadastro, setAvisoCadastro] = useState(false);
  const submitLock = useRef(false);
  const { setValue } = form;
  const busy = form.formState.isSubmitting;
  const devedorValido = clientes.some((cliente) => cliente.id === selectedClienteId);

  useEffect(() => {
    if (!open || !selectedClienteId) return;

    setValue("clienteId", String(selectedClienteId), {
      shouldValidate: true,
      shouldDirty: true,
    });

  }, [open, selectedClienteId, setValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setErro(null);
    try {
      await form.onSubmit(values);
      onCreated?.();
      setOpen(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar o empréstimo.");
    } finally { submitLock.current = false; }
  });

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!busy) { setOpen(value); setErro(null); setAvisoCadastro(false); setValue("fiadorId", ""); } }}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || !perfilAtivo || !devedorValido}
          className={cn("gap-2", triggerClassName)}
        >
          <PlusCircle className="h-4 w-4" />
          Criar Empréstimo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">Novo Empréstimo</DialogTitle>
          <DialogDescription>
            O empréstimo será criado para o cliente selecionado na página.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm">Devedor</Label>
            <div className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900">
              {selectedClienteName ?? "—"}
            </div>
            <p className="text-xs text-slate-500">
              Para trocar o cliente, selecione outro no topo da página.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Credor</Label>
            <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">{perfilAtivo?.nome ?? "Nenhum perfil selecionado"}</div>
            <p className="text-xs text-slate-500">Perfil ativo</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiadorId">Fiador *</Label>
            <Controller name="fiadorId" control={form.control} render={({ field, fieldState }) => (
              <FiadorSelector clientes={clientes} excluirClienteId={selectedClienteId}
                value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                triggerRef={field.ref} disabled={busy} invalid={fieldState.invalid} />
            )} />
            <ModalCadastro
              trigger={<Button type="button" variant="outline" disabled={busy || !perfilAtivo} className="gap-2"><PlusCircle className="h-4 w-4" />Cadastrar novo fiador</Button>}
              onSuccess={async () => {
                await onClienteCreated();
                setAvisoCadastro(true);
              }}
            />
            {avisoCadastro && <p role="status" className="text-sm text-emerald-700">Cliente cadastrado. Selecione-o na lista de fiadores para continuar.</p>}
          </div>

          <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="novo-valorEmprestado" className="text-sm">Valor emprestado</Label>
              <Input
                placeholder="Ex: 3000"
                inputMode="decimal"
                id="novo-valorEmprestado" {...form.register("valorEmprestado")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-quantidadeParcelas" className="text-sm">Quantidade de parcelas</Label>
              <Input
                placeholder="Ex: 6"
                inputMode="numeric"
                id="novo-quantidadeParcelas" {...form.register("quantidadeParcelas")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-jurosCobrado" className="text-sm">Juros (%)</Label>
              <Input
                placeholder="Ex: 12"
                inputMode="decimal"
                id="novo-jurosCobrado" {...form.register("jurosCobrado")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-formaPagamento" className="text-sm">Forma de pagamento</Label>
              <select
                id="novo-formaPagamento" {...form.register("formaPagamento")}
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

            <div className="space-y-2">
              <Label htmlFor="novo-frequenciaPagamento" className="text-sm">Frequência de pagamento</Label>
              <select
                id="novo-frequenciaPagamento" {...form.register("frequenciaPagamento")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
                defaultValue="MENSAL"
              >
                <option value="MENSAL">Mensal</option>
                <option value="QUINZENAL">Quinzenal</option>
                <option value="SEMANAL">Semanal</option>
                <option value="DIARIO">Diário</option>
              </select>
              <p className="text-xs text-slate-500">
                Diário gera parcelas todos os dias; quinzenal gera a cada 15 dias.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-tipoContrato" className="text-sm">Tipo de contrato</Label>
              <select
                id="novo-tipoContrato" {...form.register("tipoContrato")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
                defaultValue="FISICO"
              >
                <option value="FISICO">Físico</option>
                <option value="DIGITAL">Digital</option>
              </select>
            </div>
          </fieldset>

          {Object.entries(form.formState.errors).map(([campo, error]) => <p key={campo} role="alert" className="text-xs text-red-600">{error.message}</p>)}
          {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={busy}>
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="gap-2"
              disabled={busy || !selectedClienteId || !perfilAtivo || !devedorValido}
            >
              <PlusCircle className="h-4 w-4" />
              {busy ? "Criando..." : "Criar empréstimo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
