import { useRef, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUserPlus } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClienteFormFields } from "@/components/ClienteFormFields";
import { clienteCreateSchema, clienteCreatePayload, dadosParaFormulario, type ClienteCreateForm } from "@/schemas/clientes.schemas";
import { clientesService } from "@/services/clientes.service";
import { useProfile } from "@/contexts/ProfileContext";

type ModalCadastroProps = {
  onSuccess: () => Promise<void> | void;
  trigger?: ReactElement;
};

export function ModalCadastro({ onSuccess, trigger }: ModalCadastroProps) {
  const { perfilAtivo } = useProfile();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState(false);
  const submitting = useRef(false);
  const form = useForm<ClienteCreateForm>({ resolver: zodResolver(clienteCreateSchema), mode: "onChange", defaultValues: dadosParaFormulario() });
  async function onSubmit(data: ClienteCreateForm) {
    if (submitting.current) return;
    submitting.current = true;
    setErro(null);
    try {
      if (!perfilAtivo) throw new Error("Selecione um perfil antes de cadastrar o cliente.");
      if (!criado) {
        await clientesService.create(clienteCreatePayload(data));
        setCriado(true);
      }
      await onSuccess();
      form.reset(dadosParaFormulario());
      setCriado(false);
      setOpen(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao salvar o cliente.");
    } finally { submitting.current = false; }
  }
  const busy = form.formState.isSubmitting;
  function alterarAbertura(value: boolean) {
    if (busy) return;
    setOpen(value);
    setErro(null);
    if (!value && criado) {
      setCriado(false);
      form.reset(dadosParaFormulario());
    }
  }
  return <Dialog open={open} onOpenChange={alterarAbertura}>
    <DialogTrigger asChild>{trigger ?? <Button type="button" disabled={!perfilAtivo} className="gap-2"><FiUserPlus /> Novo Cliente</Button>}</DialogTrigger>
    <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col sm:max-w-2xl">
      <DialogHeader><DialogTitle>Cadastrar Novo Cliente</DialogTitle><DialogDescription>Preencha o nome, a forma gramatical do documento e o endereço. Os demais dados são opcionais.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => { event.stopPropagation(); void form.handleSubmit(onSubmit)(event); }} className="flex min-h-0 flex-col gap-4">
        <div className="min-h-0 overflow-y-auto pr-1"><ClienteFormFields form={form} disabled={busy || criado} /></div>
        {criado && <p role="status" className="text-sm text-emerald-700">Cliente já cadastrado. Atualize a lista para continuar.</p>}
        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        <DialogFooter className="shrink-0 gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => alterarAbertura(false)}>Cancelar</Button><Button type="submit" disabled={busy || !form.formState.isValid || !perfilAtivo}>{busy ? "Salvando..." : criado ? "Atualizar lista" : "Salvar Cliente"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
