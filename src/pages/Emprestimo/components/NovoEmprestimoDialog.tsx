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
  DialogBody, DialogSection,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, UsersRound, WalletCards, Settings2 } from "lucide-react";

import { useEmprestimo } from "@/hooks/useEmprestimo";
import { cn } from "@/lib/utils";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente } from "@/types";
import { ModalCadastro } from "@/components/ModalCadastro";
import { ErroOperacao } from "@/components/ErroOperacao";
import { aplicarErrosFormulario } from "@/lib/errosFormulario";
import type { EmprestimoFormData } from "@/hooks/useEmprestimo";

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
  const [erro, setErro] = useState<unknown>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [avisoCadastro, setAvisoCadastro] = useState(false);
  const submitLock = useRef(false);
  const { setValue } = form;
  const busy = form.formState.isSubmitting || enviando;
  const devedorValido = clientes.some((cliente) => cliente.id === selectedClienteId);
  const acessibilidade = (campo: keyof EmprestimoFormData) => ({
    "aria-invalid": !!form.formState.errors[campo],
    "aria-describedby": form.formState.errors[campo] ? `novo-${campo}-erro` : undefined,
  });
  const erroCampo = (campo: keyof EmprestimoFormData) => form.formState.errors[campo] && <p id={`novo-${campo}-erro`} role="alert" className="text-xs text-red-600">{form.formState.errors[campo]?.message}</p>;

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
    setEnviando(true);
    setErro(null);
    try {
      await form.onSubmit(values);
      onCreated?.();
      setOpen(false);
      setSucesso(true);
    } catch (error) {
      setErro(error); aplicarErrosFormulario(error, form);
    } finally { submitLock.current = false; setEnviando(false); }
  }, () => setErro("Corrija os campos destacados antes de criar o empréstimo."));

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!busy) { setOpen(value); if (value) setSucesso(false); setErro(null); setAvisoCadastro(false); setValue("fiadorId", ""); } }}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || !perfilAtivo || !devedorValido}
          className={cn("gap-2", triggerClassName)}
        >
          <PlusCircle className="h-4 w-4" />
          Criar Empréstimo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Empréstimo</DialogTitle>
          <DialogDescription>
            O empréstimo será criado para o cliente selecionado na página.
          </DialogDescription>
        </DialogHeader>

        <form onChange={() => setErro(null)} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden [&_[aria-invalid=true]]:border-red-400">
          <DialogBody>
          <DialogSection title="Pessoas envolvidas" icon={<UsersRound />}>
          <div className="grid gap-4 sm:grid-cols-2">
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

          </div>
          <div className="space-y-2">
            <Label htmlFor="fiadorId">Fiador *</Label>
            <Controller name="fiadorId" control={form.control} render={({ field, fieldState }) => (
              <FiadorSelector clientes={clientes} excluirClienteId={selectedClienteId}
                value={field.value} onChange={(value) => { field.onChange(value); setErro(null); }} onBlur={field.onBlur}
                triggerRef={field.ref} disabled={busy} invalid={fieldState.invalid} describedBy={fieldState.invalid ? "novo-fiadorId-erro" : undefined} />
            )} />
            {erroCampo("fiadorId")}
            <p className="text-xs text-slate-500">Selecione outra pessoa como fiador. O próprio devedor não aparece nesta lista.</p>
            <ModalCadastro
              trigger={<Button type="button" variant="outline" disabled={busy || !perfilAtivo} className="gap-2"><PlusCircle className="h-4 w-4" />Cadastrar novo fiador</Button>}
              onSuccess={async () => {
                await onClienteCreated();
                setAvisoCadastro(true);
              }}
            />
            {avisoCadastro && <p role="status" className="text-sm text-emerald-700">Cliente cadastrado. Selecione-o na lista de fiadores para continuar.</p>}
          </div>

          </DialogSection>
          <DialogSection title="Dados financeiros" icon={<WalletCards />}>
          <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="novo-valorEmprestado" className="text-sm">Valor emprestado</Label>
              <Input
                placeholder="Ex: 3000"
                inputMode="decimal"
                id="novo-valorEmprestado" {...form.register("valorEmprestado")} {...acessibilidade("valorEmprestado")}
              />
              {erroCampo("valorEmprestado")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-quantidadeParcelas" className="text-sm">Quantidade de parcelas</Label>
              <Input
                placeholder="Ex: 6"
                inputMode="numeric"
                id="novo-quantidadeParcelas" {...form.register("quantidadeParcelas")} {...acessibilidade("quantidadeParcelas")}
              />
              {erroCampo("quantidadeParcelas")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-jurosCobrado" className="text-sm">Juros (%)</Label>
              <Input
                placeholder="Ex: 12"
                inputMode="decimal"
                id="novo-jurosCobrado" {...form.register("jurosCobrado")} {...acessibilidade("jurosCobrado")}
              />
              {erroCampo("jurosCobrado")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="novo-formaPagamento" className="text-sm">Forma de pagamento</Label>
              <select
                id="novo-formaPagamento" {...form.register("formaPagamento")} {...acessibilidade("formaPagamento")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione a forma
                </option>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">DINHEIRO</option>
              </select>
              {erroCampo("formaPagamento")}
            </div>

          </fieldset>
          </DialogSection>
          <DialogSection title="Configurações do empréstimo" icon={<Settings2 />}>
          <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          </DialogSection>
          <ErroOperacao erro={erro} titulo="Não foi possível criar o empréstimo" />

          </DialogBody>
          <DialogFooter>
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
      {sucesso && <p role="status" className="text-sm text-emerald-700">Empréstimo criado com sucesso.</p>}
    </Dialog>
  );
}
