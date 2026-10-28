import { useRef, useState } from "react";
import { ErroOperacao } from "@/components/ErroOperacao";
import { textoPublico } from "@/services/apiError";
import { ImportacaoClientesCsvCard } from "./ImportacaoClientesCsvCard";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { apiClient } from "@/services/apiClient";

export function BackupPage() {
  const importLock = useRef(false), exportLock = useRef(false);
  const [erroOperacao, setErroOperacao] = useState<unknown>(null);
  const [detalhes, setDetalhes] = useState<{ linha: number; motivo: string; cliente?: string; nome?: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);

  async function handleImport() {
    if (importLock.current) return;
    if (!file) {
      setMessage("Selecione um arquivo Excel antes de importar.");
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      importLock.current = true; setErroOperacao(null); setDetalhes([]);
      setLoading(true); setAvisos([]);
      setMessage(null);

      const resultado = await apiClient.post<{
        totalLinhas: number;
        linhasImportadas: number;
        linhasIgnoradas: number;
        linhasDuplicadas: number;
        erros: { linha: number; motivo: string }[];
        formato?: string;
        clientesCriados?: number;
        clientesReutilizados?: number;
        clientesAtualizados?: number;
        avisos?: string[];
      }>("/import", formData);

      setDetalhes(resultado.erros);
      const completo = resultado.formato === "EXCEL_V3";
      setAvisos(resultado.avisos ?? []);
      setMessage(completo
        ? `${resultado.clientesCriados ?? 0} cliente(s) criado(s), ${resultado.clientesReutilizados ?? 0} reutilizado(s), ${resultado.clientesAtualizados ?? 0} atualizado(s) em campos vazios. ${resultado.linhasImportadas} empréstimo(s) restaurado(s), ${resultado.linhasDuplicadas} já existente(s).`
        : `${resultado.linhasImportadas} linha(s) importada(s), ${resultado.linhasIgnoradas} ignorada(s), ${resultado.linhasDuplicadas} duplicada(s).`);
      setError(resultado.linhasIgnoradas > 0 || (!completo && resultado.totalLinhas > 0 && resultado.linhasImportadas === 0));
      if (resultado.linhasIgnoradas === 0 && resultado.linhasDuplicadas === 0) setFile(null);
    } catch (err) {
      console.error(err);
      setMessage(null); setErroOperacao(err);
      setError(true);
    } finally {
      setLoading(false);
      importLock.current = false;
    }
  }

  async function handleExport() {
    if (exportLock.current) return;
    try {
      exportLock.current = true; setErroOperacao(null);
      setExporting(true);
      setMessage(null);

      const { blob, contentType } = await apiClient.getBlob("/export", "backup.xlsx");
      if (!contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) throw new Error("Não foi possível baixar o arquivo.");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const today = new Date().toISOString().slice(0, 10);
      a.download = `backup-${today}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Exportação concluída! Arquivo baixado.");
      setError(false);
    } catch (err) {
      console.error(err);
      setMessage(
        err instanceof Error ? err.message : "Não foi possível baixar o arquivo."
      );
      setError(true);
    } finally {
      setExporting(false);
      exportLock.current = false;
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 py-6">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            Backup Excel operacional
          </CardTitle>
          <CardDescription>
            O Excel v3 preserva os dados cadastrais de todos os clientes do perfil, empréstimos,
            vínculos de fiadores e parcelas, incluindo valores pagos e pagamentos parciais.
            A restauração utiliza o perfil selecionado.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Não inclui documentos gerados, DOCX, PDF, PDF assinado, promissórias, snapshots,
              hashes, observações das parcelas ou dados cadastrais do perfil.</p>
            <p>Planilhas antigas continuam aceitas, mas restauram somente os dados presentes nelas.
              O backup v3 deve ser importado sem editar suas abas; a aba Backup é um resumo visual.</p>
            <p>Cadastros existentes são preservados. Conflitos interrompem a restauração v3;
              somente campos vazios podem ser preenchidos, sem substituir dados válidos.</p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="secondary"
            className="w-full rounded-xl text-base gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exportando..." : "Exportar Backup (Excel)"}
          </Button>

          <div className="h-px bg-slate-200" />

          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:bg-muted/40 transition">
            <FileSpreadsheet className="w-10 h-10 mb-3 text-muted-foreground" />

            <span className="font-medium">
              {file ? file.name : "Clique para selecionar o arquivo"}
            </span>

            <span className="text-sm text-muted-foreground mt-1">
              Apenas arquivos .xlsx são permitidos
            </span>

            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ""; }}
            />
          </label>

          {message && (
            <div
              role={error ? "alert" : "status"}
              className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                error
                  ? "bg-amber-50 text-amber-900"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {error ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {message}
            </div>
          )}
          {avisos.length > 0 && <section aria-label="Observações da restauração" className="space-y-2 rounded-xl border p-3 text-sm text-muted-foreground">
            {avisos.map((aviso, i) => <p key={i}>{textoPublico(aviso, "Revise o resultado da restauração.")}</p>)}
          </section>}
          <ErroOperacao erro={erroOperacao} titulo="Não foi possível importar o Excel" />
          {detalhes.length > 0 && <section aria-label="Pendências da importação Excel" className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-amber-200 p-3 text-sm">
            <h3 className="font-semibold">Linhas que precisam de revisão ({detalhes.length})</h3>
            <ul className="space-y-3">{detalhes.map((d, i) => <li key={`${d.linha}-${i}`} className="break-words border-t pt-2">
              <span className="font-medium">Linha {d.linha}{d.cliente || d.nome ? ` — ${textoPublico(d.cliente ?? d.nome, "Cliente")}` : ""}</span>
              <p>{textoPublico(d.motivo, "Não foi possível processar esta linha. Revise os dados do arquivo.")}</p>
            </li>)}</ul>
            <p>Corrija as linhas indicadas no arquivo antes de tentar novamente.</p>
          </section>}

          <Button
            onClick={handleImport}
            disabled={loading}
            className="w-full rounded-xl text-base"
          >
            {loading ? "Importando..." : "Importar clientes + empréstimos"}
          </Button>
        </CardContent>
      </Card>
      <Card className="w-full max-w-xl shadow-xl rounded-2xl border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Backup integral PostgreSQL</CardTitle>
          <CardDescription>
            Preserva todas as tabelas do banco, incluindo perfis, cadastros, dados financeiros,
            observações e documentos armazenados no banco, com seus snapshots e hashes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>A geração e a restauração integral não estão disponíveis nesta tela.
            Devem ser feitas na administração do PostgreSQL, com pg_dump e pg_restore.</p>
          <p>Arquivos e configurações externos ao banco exigem cópia separada.</p>
        </CardContent>
      </Card>
      <ImportacaoClientesCsvCard />
    </div>
  );
}
