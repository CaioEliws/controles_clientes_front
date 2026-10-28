import { ErroOperacao } from "@/components/ErroOperacao";
import { CorrecaoDadosContrato } from "@/components/contratos/CorrecaoDadosContrato";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ModalCadastro } from "@/components/ModalCadastro";
import { DadosContratoView } from "./DadosContratoView";
import { ContratosGerados } from "./ContratosGerados";
import { contratoService, type ContratoPrevia } from "@/services/contrato.service";
import { emprestimosService } from "@/services/emprestimos.service";
import type { Cliente } from "@/types";

type Props = {
  clienteId: number;
  emprestimoId: number;
  clientes: Cliente[];
  onClientesChanged: () => Promise<void>;
  onRegularizado?: () => void;
  onClose: () => void;
};

const mensagem = (error: unknown) => error instanceof Error ? error.message : "Não foi possível consultar os dados do contrato.";

export function DadosContratoDialog({ clienteId, emprestimoId, clientes, onClientesChanged, onRegularizado, onClose }: Props) {
  const [previa, setPrevia] = useState<ContratoPrevia | null>(null);
  const [erro, setErro] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [regularizando, setRegularizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [fiadorId, setFiadorId] = useState("");
  const [erroFiador, setErroFiador] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const mounted = useRef(false);
  const lock = useRef(false);
  // Reuse the initial promise during StrictMode's effect replay; no duplicate GET.
  const inicial = useRef<Promise<ContratoPrevia> | null>(null);

  useEffect(() => {
    let alive = true;
    mounted.current = true;
    inicial.current ??= contratoService.getPrevia(clienteId, emprestimoId);
    inicial.current.then((response) => { if (alive) setPrevia(response); })
      .catch((error: unknown) => { if (alive) setErro(error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; mounted.current = false; };
  }, [clienteId, emprestimoId]);

  async function consultar() {
    setLoading(true);
    setPrevia(null);
    setErro(null);
    try {
      const response = await contratoService.getPrevia(clienteId, emprestimoId);
      if (mounted.current) setPrevia(response);
    } catch (error) { if (mounted.current) setErro(error); }
    finally { if (mounted.current) setLoading(false); }
  }

  async function repetirConsulta() {
    if (lock.current) return;
    lock.current = true;
    try { await consultar(); } finally { lock.current = false; }
  }

  async function regularizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const id = Number(fiadorId);
    if (!Number.isSafeInteger(id) || id <= 0 || !clientes.some((cliente) => cliente.id === id)) {
      setErroFiador("Selecione um fiador do perfil ativo.");
      return;
    }
    lock.current = true;
    setSalvando(true);
    setErroFiador(null);
    try {
      await emprestimosService.alterarFiador(clienteId, emprestimoId, { fiadorId: id });
      if (!mounted.current) return;
      setRegularizando(false);
      setAviso("Fiador regularizado.");
      onRegularizado?.();
      await consultar();
    } catch (error) { if (mounted.current) setErroFiador(mensagem(error)); }
    finally {
      lock.current = false;
      if (mounted.current) setSalvando(false);
    }
  }

  const semFiador = /não possui fiador|fiador não pode ser.*próprio|fiador e devedor devem ser pessoas diferentes/i.test(mensagem(erro));
  return <Dialog open onOpenChange={(open) => { if (!open && !salvando) onClose(); }}>
    <DialogContent className="max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Dados do contrato</DialogTitle>
        <DialogDescription>Empréstimo #{emprestimoId}. Confira os dados cadastrais e as parcelas.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        {aviso && <p role="status" className="text-sm text-emerald-700">{aviso}</p>}
        {loading && <p role="status" className="py-8 text-center text-slate-500">Carregando dados do contrato...</p>}
        {!loading && !!erro && <div className="space-y-3">
          <ErroOperacao erro={erro} titulo="Não foi possível preparar o contrato" />
          <CorrecaoDadosContrato erro={erro} clienteId={clienteId} emprestimoId={emprestimoId} onCorrigido={() => { void consultar(); }} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={salvando} onClick={() => { void repetirConsulta(); }}>Consultar novamente</Button>
            {semFiador && !regularizando && <Button type="button" disabled={salvando} onClick={() => setRegularizando(true)}>Regularizar fiador</Button>}
          </div>
        </div>}
        {!loading && semFiador && regularizando && <form onSubmit={(event) => { void regularizar(event); }} className="space-y-3 rounded-xl border p-4">
          <h3 className="font-semibold">Regularizar fiador</h3>
          <Label htmlFor="fiador-legado">Fiador *</Label>
          <select id="fiador-legado" value={fiadorId} aria-required="true" disabled={salvando} onChange={(event) => { setFiadorId(event.target.value); setErroFiador(null); }} className="h-10 w-full rounded-md border bg-white px-3 text-sm">
            <option value="" disabled>Selecione um fiador</option>
            {clientes.filter(cliente => cliente.id !== clienteId).map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
          </select>
          <ModalCadastro trigger={<Button type="button" variant="outline" disabled={salvando}>Cadastrar novo fiador</Button>} onSuccess={async () => {
            await onClientesChanged();
            if (mounted.current) setAviso("Cliente cadastrado. Selecione-o na lista de fiadores para continuar.");
          }} />
          {erroFiador && <p role="alert" className="text-sm text-red-600">{erroFiador}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={salvando} onClick={() => { setRegularizando(false); setFiadorId(""); setErroFiador(null); }}>Cancelar regularização</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando fiador..." : "Salvar fiador"}</Button>
          </div>
        </form>}
        {!loading && previa && <DadosContratoView dados={previa.dados} />}
        <ContratosGerados key={`${clienteId}-${emprestimoId}`} clienteId={clienteId} emprestimoId={emprestimoId} podeGerar={!loading && !erro && previa?.validoParaGeracao === true} />
      </DialogBody>
      <DialogFooter><Button type="button" variant="outline" disabled={salvando} onClick={onClose}>Fechar</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
