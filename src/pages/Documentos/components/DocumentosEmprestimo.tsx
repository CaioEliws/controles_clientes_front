import { useCallback, useEffect, useRef, useState } from "react";
import { AvisoContratoExcluido } from "@/components/contratos/ExcluirContratoButton";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { contratoService } from "@/services/contrato.service";
import { useConsulta } from "../useConsulta";
import { DadosContratoResumo } from "./DadosContratoResumo";
import { DocumentosHistorico } from "./DocumentosHistorico";

export function DocumentosEmprestimo({ clienteId, emprestimoId }: { clienteId: number; emprestimoId: number }) {
  const carregarDados = useCallback(() => contratoService.getPrevia(clienteId, emprestimoId), [clienteId, emprestimoId]);
  const carregarHistorico = useCallback(() => contratoService.listar(clienteId, emprestimoId), [clienteId, emprestimoId]);
  const dados = useConsulta(carregarDados);
  const historico = useConsulta(carregarHistorico);
  const [confirmacao, setConfirmacao] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);
  const [erroGeracao, setErroGeracao] = useState<string | null>(null);
  const [erroDownload, setErroDownload] = useState<string | null>(null);
  const [excluido, setExcluido] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [geracaoInvalida, setGeracaoInvalida] = useState(false);
  const mounted = useRef(true);
  const lock = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const podeGerar = dados.data?.validoParaGeracao === true && !dados.loading && !dados.error && !geracaoInvalida;
  const busy = gerando || baixando !== null;

  async function gerar() {
    if (lock.current || !podeGerar) return;
    lock.current = true;
    setGerando(true);
    setErroGeracao(null);
    setSucesso(false);
    try {
      const documento = await contratoService.gerar(clienteId, emprestimoId);
      if (!mounted.current) return;
      // Keep the successful POST result available even if the subsequent list fails.
      historico.setData((lista) => [documento, ...(lista ?? []).filter((item) => item.id !== documento.id)]);
      setSucesso(true);
      setConfirmacao(false);
      historico.recarregar();
    } catch (error) {
      if (mounted.current) {
        const texto = error instanceof Error ? error.message : "Não foi possível gerar os documentos.";
        setErroGeracao(texto);
        setGeracaoInvalida(texto.toLowerCase().includes("incomplet") || texto.includes("não possui fiador"));
        setConfirmacao(false);
      }
    } finally { lock.current = false; if (mounted.current) setGerando(false); }
  }

  async function baixar(id: number, tipo: "pdf" | "pdf-assinado" | "word") {
    if (lock.current) return;
    lock.current = true;
    setBaixando(`${id}-${tipo}`);
    setErroDownload(null);
    try {
      const { blob, nomeArquivo } = await (tipo === "pdf" ? contratoService.baixarPdf : tipo === "pdf-assinado" ? contratoService.baixarPdfAssinado : contratoService.baixar)(clienteId, emprestimoId, id);
      if (!mounted.current) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      document.body.append(link);
      try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    } catch (error) { if (mounted.current) setErroDownload(error instanceof Error ? error.message : "Não foi possível baixar o documento."); }
    finally { lock.current = false; if (mounted.current) setBaixando(null); }
  }

  const incompleto = dados.error?.toLowerCase().includes("incomplet") ?? false;
  const cadastroPendente = !!dados.error && /(?:dados do (?:devedor|fiador) incompletos|não possui fiador|sexo\/forma gramatical|UF emissora)/i.test(dados.error);
  return <div className="space-y-5">
    <section className="rounded-2xl border bg-slate-50 p-5">
      <h2 className="mb-3 font-semibold">Informações do documento</h2>
      <dl className="grid gap-3 sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Credor</dt><dd>{dados.data?.dados.credor.nomeCompleto ?? "—"}</dd></div><div><dt className="text-xs text-slate-500">Testemunha</dt><dd>{dados.data?.testemunha.nome ?? "—"}</dd></div></dl>
      <p className="mt-3 text-sm text-slate-600">Promissória incluída no PDF final.</p>
    </section>
    {dados.loading && <div role="status" aria-label="Carregando dados contratuais" className="grid gap-5 sm:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-slate-100" /><div className="h-52 animate-pulse rounded-2xl bg-slate-100" /><span className="sr-only">Carregando dados contratuais...</span></div>}
    {!dados.loading && dados.error && <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold">{incompleto ? "Cadastro incompleto" : "Não é possível gerar o documento"}</h2>
      <p role="alert" className="break-words text-sm">{dados.error}</p>
      {cadastroPendente && <p className="text-sm">Complete os cadastros antes de gerar. Para regularizar o fiador, use Dados do contrato na tela Empréstimo.</p>}
      <div className="flex flex-wrap gap-3">{cadastroPendente && <><Link className="text-sm underline" to="/clientes">Editar cliente ou fiador</Link><Link className="text-sm underline" to="/emprestimo">Ir para Empréstimos</Link></>}<Button type="button" variant="outline" onClick={dados.recarregar}>Consultar novamente</Button></div>
    </section>}
    {!dados.loading && !dados.error && dados.data && <DadosContratoResumo dados={dados.data.dados} />}
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5">
      {podeGerar ? <p role="status" className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-5 w-5" />Dados prontos para geração</p> : <p className="text-sm text-slate-500">Aguarde dados contratuais válidos para gerar.</p>}
      <Button type="button" disabled={!podeGerar || busy} onClick={() => setConfirmacao(true)}>{gerando ? "Gerando documentos..." : "Gerar contrato + promissória"}</Button>
    </div>
    {erroGeracao && <div className="space-y-2"><p role="alert" className="text-sm text-red-600">Erro ao gerar documentos: {erroGeracao}</p>
      {geracaoInvalida && <Button type="button" variant="outline" onClick={() => { setGeracaoInvalida(false); setErroGeracao(null); dados.recarregar(); }}>Revalidar dados contratuais</Button>}
    </div>}
    {sucesso && <p role="status" className="text-sm text-emerald-700">Documentos gerados com sucesso.</p>}
    {erroDownload && <p role="alert" className="text-sm text-red-600">Erro ao baixar documento: {erroDownload}</p>}
    {excluido && <AvisoContratoExcluido onClose={() => setExcluido(false)} />}
    <DocumentosHistorico clienteId={clienteId} emprestimoId={emprestimoId} onExcluido={(id) => { historico.setData((lista) => (lista ?? []).filter((item) => item.id !== id)); setExcluido(true); }} documentos={historico.data ?? []} loading={historico.loading} error={historico.error} disabled={busy} baixando={baixando} onRetry={historico.recarregar} onDownload={(id, tipo) => { void baixar(id, tipo); }} />
    <Dialog open={confirmacao} onOpenChange={(value) => { if (!gerando) setConfirmacao(value); }}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg"><DialogHeader><DialogTitle>Gerar documentos?</DialogTitle><DialogDescription>Será criado um novo documento histórico usando os dados exibidos atualmente.</DialogDescription></DialogHeader>
        <DialogFooter className="gap-2"><Button type="button" variant="outline" disabled={gerando} onClick={() => setConfirmacao(false)}>Cancelar</Button><Button type="button" disabled={gerando || !podeGerar} onClick={() => { void gerar(); }}>{gerando ? "Gerando documentos..." : "Gerar documentos"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
