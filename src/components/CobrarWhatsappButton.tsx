import { useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import type { Cliente, ParcelaResponse } from "@/types";
import { clientesService } from "@/services/clientes.service";
import { formatDate } from "@/utils/format";
import { formatarWhatsapp, linkWhatsapp, mensagemCobranca, normalizarWhatsapp, parcelaCobravel } from "@/utils/whatsapp";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { EditarClienteDialog } from "@/components/EditarClienteDialog";

export type ControlesContatoWhatsapp = { cobrar: () => void; editar: () => void; ocupado: boolean; telefoneValido: boolean; cobravel: boolean };
type Props = { incluirHoje?: boolean; parcela: ParcelaResponse; contatoAtualizado?: Cliente; onContatoAtualizado?: (cliente: Cliente) => void; renderControls?: (controles: ControlesContatoWhatsapp) => ReactNode };
export function CobrarWhatsappButton({ parcela, ...props }: Props) {
  const { perfilAtivo } = useProfile();
  if (!perfilAtivo || (!props.renderControls && !parcelaCobravel(parcela, new Date(), props.incluirHoje))) return null;
  return <ContatoDaParcela key={`${perfilAtivo.id}-${parcela.idEmprestimo}-${parcela.numeroParcela}-${parcela.clienteId}`} parcela={parcela} {...props} />;
}
function ContatoDaParcela({ parcela, contatoAtualizado, onContatoAtualizado, renderControls, incluirHoje = false }: Props) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [previa, setPrevia] = useState(false), [edicao, setEdicao] = useState(false);
  const [ocupado, setOcupado] = useState(false), [erro, setErro] = useState<string | null>(null), [aviso, setAviso] = useState<string | null>(null);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  const cobravel = parcelaCobravel(parcela, new Date(), incluirHoje);
  const telefone = contatoAtualizado ? contatoAtualizado.telefoneWhatsapp : cliente ? cliente.telefoneWhatsapp : parcela.telefoneWhatsapp;
  const valido = normalizarWhatsapp(telefone) !== null;
  const mensagem = mensagemCobranca(cliente?.nome ?? parcela.nomeCliente, parcela.dataVencimento);
  const link = telefone && mensagem && cobravel ? linkWhatsapp(telefone, mensagem) : null;
  async function carregar(editar: boolean) {
    if (!parcela.clienteId || ocupado || (!editar && !cobravel)) return;
    setOcupado(true); setErro(null); setAviso(null);
    try {
      const dados = await clientesService.getById(parcela.clienteId);
      if (!ativo.current) return;
      if (dados.id !== parcela.clienteId) throw new Error();
      setCliente(dados); onContatoAtualizado?.(dados);
      if (editar || !normalizarWhatsapp(dados.telefoneWhatsapp)) setEdicao(true);
      else if (!mensagemCobranca(dados.nome, parcela.dataVencimento)) setErro("Confira o nome do cliente e o vencimento antes de cobrar.");
      else setPrevia(true);
    } catch { if (ativo.current) setErro("Não foi possível consultar o contato deste cliente. Tente novamente."); }
    finally { if (ativo.current) setOcupado(false); }
  }
  if (!parcela.clienteId && !renderControls) return <span className="text-xs text-slate-500">Contato do cliente indisponível.</span>;
  return <div className={renderControls ? "contents" : "space-y-1 text-left"}>
    {renderControls ? renderControls({ cobrar: () => { void carregar(false); }, editar: () => { void carregar(true); }, ocupado, telefoneValido: valido, cobravel }) : <>
    {!valido && <p className="whitespace-normal text-xs text-slate-500">{telefone ? "WhatsApp cadastrado inválido." : "Este cliente não possui WhatsApp cadastrado."}</p>}
    <Button type="button" size="sm" variant="outline" className="gap-1.5 border-emerald-200 text-emerald-800 hover:bg-emerald-50" disabled={ocupado} onClick={() => { void carregar(!valido); }}>
      <MessageCircle className="h-4 w-4" />{ocupado ? "Consultando contato..." : valido ? "Cobrar pelo WhatsApp" : "Cadastrar WhatsApp"}
    </Button>
    {!previa && erro && <p role="alert" className="max-w-xs whitespace-normal text-xs text-red-700">{erro}</p>}
    {!previa && aviso && <p role="status" className="whitespace-normal text-xs text-emerald-800">{aviso}</p>}
    </>}
    {renderControls && <Dialog open={!!erro && !previa} onOpenChange={(open) => { if (!open) setErro(null); }}>
      <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Não foi possível consultar o contato</DialogTitle><DialogDescription>{erro}</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setErro(null)}>Fechar</Button></DialogFooter></DialogContent>
    </Dialog>}
    <Dialog open={previa} onOpenChange={setPrevia}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Enviar cobrança</DialogTitle><DialogDescription>Confira os dados. O envio será feito manualmente no WhatsApp.</DialogDescription></DialogHeader>
        <DialogBody>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-slate-500">Cliente</dt><dd className="break-words font-medium">{cliente?.nome}</dd>
          <dt className="text-slate-500">WhatsApp</dt><dd>{formatarWhatsapp(telefone ?? "")}</dd>
          <dt className="text-slate-500">Parcela</dt><dd>{parcela.numeroParcela}</dd>
          <dt className="text-slate-500">Vencimento</dt><dd>{formatDate(parcela.dataVencimento)}</dd>
        </dl>
        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed"><p className="mb-2 font-medium">Mensagem</p><p>{mensagem ?? "Confira o nome do cliente e o vencimento."}</p></div>
        {aviso && <p role="status" className="text-sm text-emerald-800">{aviso}</p>}
        {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setPrevia(false)}>Cancelar</Button>
          <Button type="button" variant="outline" disabled={!mensagem} onClick={() => { if (!navigator.clipboard?.writeText) { setErro("Não foi possível copiar a mensagem neste navegador."); return; } if (mensagem) void navigator.clipboard.writeText(mensagem).then(() => setAviso("Mensagem copiada.")).catch(() => setErro("Não foi possível copiar a mensagem neste navegador.")); }}>Copiar mensagem</Button>
          {link ? <Button asChild><a href={link} target="_blank" rel="noopener noreferrer" onClick={(event) => { if (!cobravel) { event.preventDefault(); setErro("Esta parcela não está disponível para cobrança."); } }}>Abrir WhatsApp</a></Button> : <Button disabled>Abrir WhatsApp</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {edicao && cliente && <EditarClienteDialog cliente={cliente} onClose={() => setEdicao(false)} onSuccess={async () => {
      const atualizado = await clientesService.getById(cliente.id);
      if (ativo.current) { setCliente(atualizado); onContatoAtualizado?.(atualizado); setAviso("Contato atualizado. Confira a parcela antes de abrir o WhatsApp."); }
    }} />}
  </div>;
}
