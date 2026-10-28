import { UserRound } from "lucide-react";
import { clienteModalLayout as visual, useClienteModalViewport } from "@/components/clienteModalLayout";
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
import { ErroOperacao } from "@/components/ErroOperacao";
import { aplicarErrosFormulario } from "@/lib/errosFormulario";

type ModalCadastroProps = {
  onSuccess: () => Promise<void> | void;
  trigger?: ReactElement;
};

export function ModalCadastro({ onSuccess, trigger }: ModalCadastroProps) {
  const { perfilAtivo } = useProfile();
  const [open, setOpen] = useState(false);
  useClienteModalViewport(open);
  const [erro, setErro] = useState<unknown>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [criado, setCriado] = useState(false);
  const submitting = useRef(false);
  const form = useForm<ClienteCreateForm>({ resolver: zodResolver(clienteCreateSchema), mode: "onChange", defaultValues: dadosParaFormulario() });
  async function onSubmit(data: ClienteCreateForm) {
    if (submitting.current) return;
    submitting.current = true;
    setEnviando(true);
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
      setSucesso(true);
    } catch (error) {
      setErro(error); aplicarErrosFormulario(error, form);
    } finally { submitting.current = false; setEnviando(false); }
  }
  const busy = form.formState.isSubmitting || enviando;
  function alterarAbertura(value: boolean) {
    if (busy) return;
    setOpen(value);
    setErro(null);
    if (value) setSucesso(false);
    if (!value && criado) {
      setCriado(false);
      form.reset(dadosParaFormulario());
    }
  }
  return <Dialog open={open} onOpenChange={alterarAbertura}>
    <DialogTrigger asChild>{trigger ?? <Button type="button" disabled={!perfilAtivo} className="gap-2"><FiUserPlus /> Novo Cliente</Button>}</DialogTrigger>
    <DialogContent overlayClassName={visual.overlay} className={visual.dialog}>
      <DialogHeader className={visual.header}><div className="flex items-center gap-3"><span className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div><DialogTitle className={visual.title}>Novo cliente</DialogTitle><DialogDescription className={visual.description}>Preencha as informações cadastrais e os dados de contato.</DialogDescription></div></div></DialogHeader>
      <form onChange={() => setErro(null)} onSubmit={(event) => { event.stopPropagation(); void form.handleSubmit(onSubmit, () => setErro("Corrija os campos destacados antes de salvar o cliente."))(event); }} className={visual.form}>
        <div data-cliente-form-scroll data-testid="cliente-form-scroll" className={visual.content}><ClienteFormFields form={form} disabled={busy || criado} /></div>
        {criado && <p role="status" className={`${visual.error} text-sm text-emerald-700`}>Cliente já cadastrado. Atualize a lista para continuar.</p>}
        {erro != null && <div className={visual.error}><ErroOperacao erro={erro} titulo="Não foi possível cadastrar o cliente" /></div>}
        <DialogFooter className={visual.footer}><Button type="button" variant="outline" className={visual.cancel} disabled={busy} onClick={() => alterarAbertura(false)}>Cancelar</Button><Button type="submit" className={visual.submit} disabled={busy || !perfilAtivo}>{busy ? "Salvando..." : criado ? "Atualizar lista" : "Salvar Cliente"}</Button></DialogFooter>
      </form>
    </DialogContent>
    {sucesso && <p role="status" className="text-sm text-emerald-700">Cliente cadastrado com sucesso.</p>}
  </Dialog>;
}
