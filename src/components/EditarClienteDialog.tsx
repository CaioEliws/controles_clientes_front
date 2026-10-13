import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClienteFormFields } from "@/components/ClienteFormFields";
import { clienteUpdateSchema, clienteUpdatePayload, dadosParaFormulario, type DadosCadastraisForm } from "@/schemas/clientes.schemas";
import { clientesService } from "@/services/clientes.service";
import type { Cliente } from "@/types";

const CAMPOS_COMPLETOS = ["sexoDocumento", "nomeIndicador", "nacionalidade", "estadoCivil", "profissao", "cpf", "rg", "rgOrgaoExpedidor", "enderecoRua", "enderecoNumero", "enderecoComplemento", "enderecoBairro", "enderecoCep", "enderecoCidade", "enderecoEstado"] as const;

export function EditarClienteDialog({ cliente, onClose, onSuccess }: { cliente: Cliente; onClose: () => void; onSuccess: () => Promise<void> | void }) {
  const completo = CAMPOS_COMPLETOS.every((campo) => Object.hasOwn(cliente, campo));
  const [loading, setLoading] = useState(!completo);
  const [erro, setErro] = useState<string | null>(null);
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
      }).catch((error: unknown) => { if (alive) setErro(error instanceof Error ? error.message : "Não foi possível consultar o cliente."); })
        .finally(() => { if (alive) setLoading(false); });
    }
    return () => { alive = false; mounted.current = false; };
  }, [cliente.id, completo, reset]);
  async function onSubmit(data: DadosCadastraisForm) {
    if (submitting.current || !pronto) return;
    submitting.current = true; setErro(null);
    try {
      await clientesService.update(cliente.id, clienteUpdatePayload(data));
      if (!mounted.current) return;
      await onSuccess();
      if (mounted.current) onClose();
    } catch (error) { if (mounted.current) setErro(error instanceof Error ? error.message : "Falha ao atualizar o cliente."); }
    finally { submitting.current = false; }
  }
  const busy = form.formState.isSubmitting;
  return <Dialog open onOpenChange={(value) => { if (!value && !busy) onClose(); }}>
    <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); focoAnterior.current?.focus(); }} className="flex max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] flex-col gap-3 p-4 sm:max-w-3xl sm:p-5">
      <DialogHeader className="shrink-0 pr-5 text-left"><DialogTitle>Editar Cliente</DialogTitle><DialogDescription>Confira os dados pessoais, documentos e endereço.</DialogDescription></DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-col gap-3">
        <div className="min-h-0 overflow-y-auto pr-1">{loading ? <p role="status">Carregando dados...</p> : <ClienteFormFields form={form} disabled={busy || !pronto} layout="edicao" />}</div>
        {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}
        <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t pt-3"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button><Button type="submit" disabled={busy || loading || !pronto}>{busy ? "Salvando..." : "Salvar alterações"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
