import { UserRound } from "lucide-react";
import { clienteModalLayout as visual, useClienteModalViewport } from "@/components/clienteModalLayout";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClienteFormFields } from "@/components/ClienteFormFields";
import { clienteUpdateSchema, clienteUpdatePayload, dadosParaFormulario, type DadosCadastraisForm } from "@/schemas/clientes.schemas";
import { clientesService } from "@/services/clientes.service";
import type { Cliente } from "@/types";
import { ErroOperacao } from "@/components/ErroOperacao";
import { aplicarErrosFormulario } from "@/lib/errosFormulario";

const CAMPOS_COMPLETOS = ["telefoneWhatsapp", "sexoDocumento", "nomeIndicador", "nacionalidade", "estadoCivil", "profissao", "cpf", "rg", "rgOrgaoExpedidor", "enderecoRua", "enderecoNumero", "enderecoComplemento", "enderecoBairro", "enderecoCep", "enderecoCidade", "enderecoEstado"] as const;

export function EditarClienteDialog({ cliente, onClose, onSuccess }: { cliente: Cliente; onClose: () => void; onSuccess: () => Promise<void> | void }) {
  useClienteModalViewport(true);
  const completo = CAMPOS_COMPLETOS.every((campo) => Object.hasOwn(cliente, campo));
  const [loading, setLoading] = useState(!completo);
  const [erro, setErro] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(completo);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const focoAnterior = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const form = useForm<DadosCadastraisForm>({ resolver: zodResolver(clienteUpdateSchema), mode: "onChange", defaultValues: dadosParaFormulario(cliente) });
  const { reset } = form;
  useEffect(() => {
    mounted.current = true;
    let alive = true;
    if (!completo) {
      clientesService.getById(cliente.id).then((dados) => {
        if (!alive) return;
        reset(dadosParaFormulario(dados)); setPronto(true);
      }).catch((error: unknown) => { if (alive) setErro(error); })
        .finally(() => { if (alive) setLoading(false); });
    }
    return () => { alive = false; mounted.current = false; };
  }, [cliente.id, completo, reset]);
  async function onSubmit(data: DadosCadastraisForm) {
    if (submitting.current || !pronto) return;
    submitting.current = true; setEnviando(true); setErro(null);
    try {
      await clientesService.update(cliente.id, clienteUpdatePayload(data));
      if (!mounted.current) return;
      await onSuccess();
      if (mounted.current) onClose();
    } catch (error) { if (mounted.current) { setErro(error); aplicarErrosFormulario(error, form); } }
    finally { submitting.current = false; if (mounted.current) setEnviando(false); }
  }
  const busy = form.formState.isSubmitting || enviando;
  return <Dialog open onOpenChange={(value) => { if (!value && !busy) onClose(); }}>
    <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); focoAnterior.current?.focus(); }} overlayClassName={visual.overlay} className={visual.dialog}>
      <DialogHeader className={visual.header}><div className="flex items-center gap-3"><span className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div><DialogTitle className={visual.title}>Editar cliente</DialogTitle><DialogDescription className={visual.description}>Atualize as informações cadastrais e os dados de contato.</DialogDescription></div></div></DialogHeader>
      <form onChange={() => setErro(null)} onSubmit={form.handleSubmit(onSubmit, () => setErro("Corrija os campos destacados antes de salvar as alterações."))} className={visual.form}>
        <div data-cliente-form-scroll data-testid="cliente-form-scroll" className={visual.content}>{loading ? <p role="status">Carregando dados...</p> : <ClienteFormFields form={form} disabled={busy || !pronto} />}</div>
        {erro != null && <div className={visual.error}><ErroOperacao erro={erro} titulo="Não foi possível atualizar o cliente" /></div>}
        <DialogFooter className={visual.footer}><Button type="button" variant="outline" className={visual.cancel} disabled={busy} onClick={onClose}>Cancelar</Button><Button type="submit" className={visual.submit} disabled={busy || loading || !pronto}>{busy ? "Salvando..." : "Salvar alterações"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
