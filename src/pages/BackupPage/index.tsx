import { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/services/apiClient";

export function BackupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            Importar Planilha
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo Excel (.xlsx) para importar os dados no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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