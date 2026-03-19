import { useState } from "react";
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
import { env } from "@/config/env";

export function BackupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function handleImport() {
    if (!file) {
      setMessage("Selecione um arquivo Excel antes de importar.");
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage(null);

      await apiClient.post("/import", formData);

      setMessage("Importação concluída com sucesso!");
      setError(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao importar arquivo.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      setMessage(null);

      const API_URL = env.API_URL;
      const perfilId = localStorage.getItem("perfil_ativo_id");

      const resp = await fetch(`${API_URL}/export`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ...(perfilId ? { "X-Perfil-Id": perfilId } : {}),
        },
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(
          `Falha ao exportar (${resp.status}). ${txt.slice(0, 200)}`
        );
      }

      const contentType = resp.headers.get("content-type") || "";

      if (
        !contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        const txt = await resp.text().catch(() => "");
        throw new Error(
          `Resposta não é XLSX (content-type: ${contentType}). Início: ${txt.slice(
            0,
            200
          )}`
        );
      }

      const blob = await resp.blob();

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
        "Erro ao exportar arquivo. Verifique se o backend está retornando XLSX."
      );
      setError(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            Backup (Importar/Exportar)
          </CardTitle>
          <CardDescription>
            Importe um Excel (.xlsx) para restaurar dados ou exporte para criar
            um backup.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {message && (
            <div
              className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                error
                  ? "bg-red-100 text-red-700"
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

          <Button
            onClick={handleImport}
            disabled={loading}
            className="w-full rounded-xl text-base"
          >
            {loading ? "Importando..." : "Importar Arquivo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}