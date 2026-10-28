import { CobrarWhatsappButton } from "@/components/CobrarWhatsappButton";
import { parcelaCobravel } from "@/utils/whatsapp";
import { useRef, useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EmprestimoDetalhado, ParcelaResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { baixarImagem, gerarImagemRelatorio, nomeImagemRelatorio } from "../exportarImagem";

type Props = { loading?: boolean; error?: string | null; parcelas: ParcelaResponse[];
  selectedClienteName?: string | null; emprestimo?: EmprestimoDetalhado | null };
const statusClasse: Record<string, string> = {
  PAGO: "border-emerald-200 bg-emerald-50 text-emerald-800", PENDENTE: "border-slate-200 bg-slate-100 text-slate-700",
  ATRASADO: "border-rose-200 bg-rose-50 text-rose-800", PARCIAL: "border-amber-200 bg-amber-50 text-amber-900",
};
const statusTexto: Record<string, string> = { PAGO: "Pago", PENDENTE: "Pendente", ATRASADO: "Atrasado", PARCIAL: "Parcial" };

export function RelatorioParcelasTable({ loading, error, parcelas, selectedClienteName, emprestimo }: Props) {
  const exportTableRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const [ocupado, setOcupado] = useState<"copiar" | "salvar" | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const ordenadas = [...parcelas].sort((a, b) => a.numeroParcela - b.numeroParcela);
  const pagas = parcelas.filter((p) => p.status === "PAGO").length;
  const valorEmprestadoDisponivel = emprestimo?.valorEmprestado != null && Number.isFinite(emprestimo.valorEmprestado);
  const podeExportar = !!emprestimo && valorEmprestadoDisponivel && !!selectedClienteName && !!parcelas.length && !loading && !error;
  async function exportar(acao: "copiar" | "salvar") {
    if (!exportTableRef.current || lock.current || !podeExportar || !emprestimo) return;
    lock.current = true; setOcupado(acao); setMensagem(null); setErro(null);
    const nome = nomeImagemRelatorio(selectedClienteName!, emprestimo.id);
    try {
      const png = gerarImagemRelatorio(exportTableRef.current);
      if (acao === "copiar" && window.isSecureContext && navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
          setMensagem("Imagem copiada com sucesso.");
        } catch {
          baixarImagem(await png, nome);
          setMensagem("Não foi possível copiar neste navegador. O PNG foi baixado.");
        }
      } else {
        baixarImagem(await png, nome);
        setMensagem(acao === "salvar" ? "Download da imagem iniciado." : "Cópia de imagem indisponível neste navegador. O PNG foi baixado.");
      }
    } catch { setErro("Não foi possível gerar a imagem. Tente novamente."); }
    finally { lock.current = false; setOcupado(null); }
  }
  return <section aria-label="Relatório das parcelas" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold text-slate-900">Parcelas do empréstimo</h2>
        <p className="mt-1 text-sm text-slate-500">Todas as parcelas, em ordem, prontas para consultar e compartilhar.</p></div>
      <div className="flex flex-wrap gap-2">
        {emprestimo && !loading && !error && !valorEmprestadoDisponivel
          ? <p role="alert" className="text-sm text-amber-800">Valor emprestado não disponível. Não é possível gerar a imagem deste empréstimo.</p>
          : <>
        <Button type="button" variant="outline" disabled={!podeExportar || !!ocupado} onClick={() => { void exportar("copiar"); }}>
          {ocupado === "copiar" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}Copiar imagem</Button>
        <Button type="button" disabled={!podeExportar || !!ocupado} onClick={() => { void exportar("salvar"); }}>
          {ocupado === "salvar" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Salvar PNG</Button>
        </>}
      </div>
    </div>
    {mensagem && <p role="status" className="px-5 pt-4 text-sm text-emerald-800">{mensagem}</p>}
    {erro && <p role="alert" className="px-5 pt-4 text-sm text-red-700">{erro}</p>}
    {loading ? <p role="status" className="p-10 text-center text-sm text-slate-500">Carregando parcelas...</p>
      : error ? <p role="alert" className="p-10 text-center text-sm text-red-700">{error}</p>
      : !emprestimo ? <p className="p-10 text-center text-sm text-slate-500">Selecione um cliente e um empréstimo para visualizar o relatório.</p>
      : <div className="bg-white p-4 text-slate-900 sm:p-6">
        <header className="mb-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Acompanhamento das parcelas · #{emprestimo.id}</p>
              <h3 className="mt-2 break-words text-xl font-semibold tracking-tight">{selectedClienteName}</h3></div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold">{emprestimo.status.replaceAll("_", " ")}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
            {[["Valor emprestado", formatCurrency(emprestimo.valorEmprestado)], ["Total a pagar", formatCurrency(emprestimo.valorTotalEmprestimo)],
              ["Parcelas", String(parcelas.length)], ["Pagas", String(pagas)], ["Em aberto", String(parcelas.length - pagas)],
              ["Valor da parcela", formatCurrency(emprestimo.valorParcela)]].map(([titulo, valor]) => <div key={titulo}>
                <dt className="text-xs text-slate-500">{titulo}</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{valor}</dd></div>)}
          </dl>
        </header>
        {ordenadas.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Nenhuma parcela encontrada para este empréstimo.</p>
          : <div ref={exportTableRef} data-testid="parcelas-print" className="bg-white">
            <header className="mb-4 space-y-1">
              <h4 className="break-words text-base font-semibold text-slate-900">{selectedClienteName}</h4>
              <p className="text-sm tabular-nums text-slate-600">Valor emprestado: {valorEmprestadoDisponivel ? formatCurrency(emprestimo.valorEmprestado) : "Não disponível"}</p>
            </header>
            <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table aria-label="Parcelas do empréstimo" className="min-w-[540px] table-fixed">
              <TableHeader className="bg-slate-100"><TableRow className="hover:bg-slate-100">
                <TableHead className="w-[18%] pl-4 text-slate-700">Nº parcela</TableHead><TableHead className="w-[28%] text-slate-700">Vencimento</TableHead>
                <TableHead className="w-[26%] text-right text-slate-700">Valor</TableHead><TableHead className="w-[28%] pr-4 text-right text-slate-700">Situação</TableHead>
              </TableRow></TableHeader>
              <TableBody>{ordenadas.map((parcela) => <TableRow key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`} className={parcela.status === "PAGO" ? "bg-emerald-50/30 hover:bg-emerald-50/60" : "hover:bg-slate-50"}>
                <TableCell className="py-3 pl-4 font-semibold tabular-nums">{parcela.numeroParcela}</TableCell>
                <TableCell className="py-3 tabular-nums text-slate-600">{formatDate(parcela.dataVencimento)}</TableCell>
                <TableCell className="py-3 text-right font-medium tabular-nums">{formatCurrency(parcela.valorParcela)}</TableCell>
                <TableCell className="py-3 pr-4 text-right"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasse[parcela.status] ?? statusClasse.PENDENTE}`}>
                  {statusTexto[parcela.status] ?? parcela.status}</span></TableCell>
              </TableRow>)}</TableBody>
            </Table>
            </div>
          </div>}
        {ordenadas.some((p) => parcelaCobravel(p)) && <section aria-label="Cobrança manual das parcelas vencidas" className="mt-5 space-y-3 rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold">Cobrança manual</h4>
          {ordenadas.filter((p) => parcelaCobravel(p)).map((p) => <div key={p.numeroParcela} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
            <span>Parcela {p.numeroParcela} · {formatDate(p.dataVencimento)}</span><CobrarWhatsappButton parcela={p} />
          </div>)}
        </section>}
        <p className="mt-4 text-xs text-slate-400">Relatório de acompanhamento · {parcelas.length} {parcelas.length === 1 ? "parcela" : "parcelas"}</p>
      </div>}
  </section>;
}
