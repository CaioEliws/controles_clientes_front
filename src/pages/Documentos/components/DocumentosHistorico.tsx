import { PdfAssinadoButton } from "@/components/contratos/PdfAssinadoButton";
import { ExcluirContratoButton } from "@/components/contratos/ExcluirContratoButton";
import { Button } from "@/components/ui/button";
import type { ContratoGeradoMetadados } from "@/services/contrato.service";

export function DocumentosHistorico({ documentos, loading, error, disabled, baixando, onRetry, onDownload, clienteId, emprestimoId, onExcluido }: {
  clienteId: number; emprestimoId: number; onExcluido: (id: number) => void;
  documentos: ContratoGeradoMetadados[]; loading: boolean; error: string | null; disabled: boolean;
  baixando: string | null; onRetry: () => void; onDownload: (id: number, tipo: "pdf" | "pdf-assinado" | "word") => void;
}) {
  const ordenados = [...documentos].sort((a, b) => Date.parse(b.dataGeracao) - Date.parse(a.dataGeracao) || b.id - a.id);
  return <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm" aria-label="Documentos gerados">
    <h2 className="text-lg font-semibold">Documentos gerados</h2>
    {loading && <p role="status" className="text-sm text-slate-500">Carregando histórico...</p>}
    {error && <div className="space-y-2"><p role="alert" className="text-sm text-red-600">Erro ao carregar histórico: {error}</p><Button type="button" variant="outline" disabled={disabled || loading} onClick={onRetry}>Atualizar histórico</Button></div>}
    {!loading && !error && documentos.length === 0 && <p className="text-sm text-slate-500">Nenhum documento gerado para este empréstimo.</p>}
    <ul className="space-y-3">{ordenados.map((documento) => <li key={documento.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
      <div><p className="font-medium">Contrato #{documento.id}</p><time className="text-sm text-slate-500" dateTime={documento.dataGeracao}>{new Date(documento.dataGeracao).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</time>
        {!documento.pdfDisponivel && <p className="text-xs text-slate-500">PDF indisponível neste registro histórico.</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={disabled || !documento.pdfDisponivel} onClick={() => onDownload(documento.id, "pdf")}>{baixando === `${documento.id}-pdf` ? "Baixando PDF..." : "Baixar PDF"}</Button>
        <PdfAssinadoButton disponivel={documento.pdfAssinadoDisponivel} disabled={disabled} baixando={baixando === `${documento.id}-pdf-assinado`} onClick={() => onDownload(documento.id, "pdf-assinado")} />
        <Button type="button" variant="outline" disabled={disabled} onClick={() => onDownload(documento.id, "word")}>{baixando === `${documento.id}-word` ? "Baixando Word..." : "Baixar Word"}</Button>
        <ExcluirContratoButton clienteId={clienteId} emprestimoId={emprestimoId} contratoId={documento.id} disabled={disabled || loading} onExcluido={onExcluido} />
      </div>
    </li>)}</ul>
  </section>;
}
