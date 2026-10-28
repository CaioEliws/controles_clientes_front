import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErroOperacao } from "@/components/ErroOperacao";
import { ApiError } from "@/services/apiError";
import { perfilExclusaoService, type ResumoExclusaoPerfil } from "@/services/perfil-exclusao.service";
import { useProfile } from "@/contexts/ProfileContext";
import type { Perfil } from "@/contexts/profileContextState";

export function ExcluirPerfilDialog({ perfil, onClose }: { perfil: Perfil; onClose: () => void }) {
  const { excluirPerfil } = useProfile();
  const [resumo, setResumo] = useState<ResumoExclusaoPerfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [nome, setNome] = useState("");
  const [erroResumo, setErroResumo] = useState<unknown>(null);
  const [erro, setErro] = useState<unknown>(null);
  const [excluindo, setExcluindo] = useState(false);
  const lock = useRef(false), mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let alive = true; const abort = new AbortController();
    setCarregando(true); setResumo(null); setErroResumo(null);
    perfilExclusaoService.resumo(perfil.id, abort.signal).then(data => { if (alive) setResumo(data); })
      .catch(error => { if (alive) setErroResumo(error); })
      .finally(() => { if (alive) setCarregando(false); });
    return () => { alive = false; abort.abort(); };
  }, [perfil.id, tentativa]);
  async function confirmar() {
    if (lock.current || carregando || !resumo || nome !== resumo.nome) return;
    lock.current = true; setExcluindo(true); setErro(null);
    try {
      await excluirPerfil(perfil.id, nome);
      if (mounted.current) onClose();
    } catch (error) {
      if (mounted.current) setErro(error instanceof ApiError && error.status === 0
        ? new Error("Não foi possível confirmar a exclusão. Confira a lista de perfis antes de tentar novamente.") : error);
    } finally { lock.current = false; if (mounted.current) setExcluindo(false); }
  }
  const nomePerfil = resumo?.nome ?? perfil.nome;
  const quantidades = resumo ? [["Clientes", resumo.clientes], ["Empréstimos", resumo.emprestimos], ["Parcelas", resumo.parcelas],
    ["Parcelas com pagamento", resumo.parcelasComPagamento], ["Contratos gerados", resumo.contratosGerados], ["Observações", resumo.observacoes]] as const : [];
  return <Dialog open onOpenChange={open => { if (!open && !lock.current) onClose(); }}>
    <DialogContent role="alertdialog" className="max-w-lg" onInteractOutside={event => { if (lock.current) event.preventDefault(); }} onEscapeKeyDown={event => { if (lock.current) event.preventDefault(); }}>
      <DialogHeader>
        <DialogTitle className="break-words">Excluir perfil “{nomePerfil}”?</DialogTitle>
        <DialogDescription>Esta ação exclui permanentemente todos os dados pertencentes a este perfil.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Essa ação não pode ser desfeita.</p>
            <p className="mt-2 leading-6">Clientes, empréstimos, parcelas, pagamentos, observações, contratos e documentos gerados deste perfil serão excluídos. Os demais perfis serão preservados.</p></div>
        </div>
        {carregando && <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin" />Consultando dados do perfil...</p>}
        <ErroOperacao erro={erroResumo} titulo="Não foi possível consultar o resumo" />
        {resumo && <div className="rounded-xl border bg-slate-50 p-4"><p className="mb-3 break-words font-semibold">{resumo.nome}</p>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">{quantidades.map(([label, quantidade]) => <div key={label} className="contents"><dt>{label}</dt><dd className="font-medium tabular-nums">{quantidade.toLocaleString("pt-BR")}</dd></div>)}</dl>
        </div>}
        <div className="space-y-2">
          <Label htmlFor="confirmar-exclusao-perfil">Para confirmar, digite o nome exato do perfil:</Label>
          <p className="break-words font-semibold text-slate-900">{nomePerfil}</p>
          <Input id="confirmar-exclusao-perfil" autoComplete="off" spellCheck={false} value={nome} disabled={excluindo || carregando || !resumo} onChange={event => setNome(event.target.value)} aria-describedby="regra-nome-exclusao" />
          <p id="regra-nome-exclusao" className="text-xs leading-5 text-slate-500">O texto deve ser idêntico, incluindo maiúsculas, minúsculas, acentos e espaços.</p>
        </div>
        <ErroOperacao erro={erro} titulo="Não foi possível excluir o perfil" />
        {(!!erroResumo || !!erro) && <Button type="button" variant="outline" disabled={excluindo} onClick={() => { setNome(""); setErro(null); setTentativa(t => t + 1); }}>Consultar resumo novamente</Button>}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" disabled={excluindo} onClick={onClose}>Cancelar</Button>
        <Button type="button" variant="destructive" disabled={excluindo || carregando || !resumo || nome !== resumo.nome} onClick={() => { void confirmar(); }}>
          {excluindo && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{excluindo ? "Excluindo perfil..." : "Excluir perfil permanentemente"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
