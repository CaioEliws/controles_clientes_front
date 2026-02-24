import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/services/apiClient";

export function BackupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
        if (!file) return alert("Selecione um arquivo Excel");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            await apiClient.post("/import", formData);

            alert("Importação concluída!");
        } catch (err) {
            console.error(err);
            alert("Erro ao importar arquivo.");
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Importar Excel</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="font-semibold">Selecione o arquivo Excel</p>

            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Importando..." : "Importar Excel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}