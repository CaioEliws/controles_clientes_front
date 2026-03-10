import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ParcelaResponse } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

type Props = {
  loading?: boolean;
  parcelas: ParcelaResponse[];
  selectedClienteName?: string | null;
};

const TABLE_COLS = 4;

function toNumberCurrency(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getStatusBadgeClassName(status?: string | null) {
  switch (status) {
    case "PAGO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ATRASADO":
      return "border-red-200 bg-red-50 text-red-700";
    case "PARCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PENDENTE":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

const headClassName =
  "whitespace-nowrap text-center border-b border-r border-slate-200 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 first:border-l";

const cellClassName =
  "text-center border-b border-r border-slate-100 px-3 py-2.5 align-middle first:border-l";

export function RelatorioParcelasTable({
  loading,
  parcelas,
  selectedClienteName,
}: Props) {
  const parcelasOrdenadas = [...parcelas].sort(
    (a, b) => a.numeroParcela - b.numeroParcela
  );

  return (
    <section className="mt-4 min-w-0 max-w-full sm:mt-6">
      <div className="max-w-full overflow-x-auto">
        <Card className="inline-block w-fit max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <CardTitle className="items-center text-center text-sm font-semibold text-slate-800 sm:text-base lg:text-lg">
                Tabela de Parcelas
              </CardTitle>

              <CardDescription className="items-center text-center mt-1 text-xs text-slate-500 sm:text-sm">
                {selectedClienteName
                  ? `Visualizando as parcelas de ${selectedClienteName}.`
                  : "Selecione um cliente e um empréstimo para visualizar as parcelas."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table className="!w-fit !inline-table table-auto whitespace-nowrap text-xs sm:text-sm">
              <TableHeader className="bg-slate-50/90">
                <TableRow className="hover:bg-slate-50/90">
                  <TableHead className={headClassName}>Nº Parcela</TableHead>
                  <TableHead className={headClassName}>
                    Data de pagamento
                  </TableHead>
                  <TableHead className={headClassName}>Valor parcela</TableHead>
                  <TableHead className={headClassName}>Situação</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-white">
                    <TableCell
                      colSpan={TABLE_COLS}
                      className="border-b border-slate-100 px-4 py-10 text-center first:border-l last:border-r"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-sm font-medium text-slate-500">
                          Carregando parcelas...
                        </span>
                        <span className="text-xs text-slate-400">
                          Aguarde enquanto o relatório é carregado.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : parcelasOrdenadas.length === 0 ? (
                  <TableRow className="hover:bg-white">
                    <TableCell
                      colSpan={TABLE_COLS}
                      className="border-b border-slate-100 px-4 py-10 text-center first:border-l last:border-r"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-sm font-medium text-slate-500">
                          Nenhuma parcela encontrada
                        </span>
                        <span className="text-xs text-slate-400">
                          Este empréstimo não possui parcelas disponíveis para
                          exibição.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  parcelasOrdenadas.map((parcela) => {
                    const valorParcela = toNumberCurrency(parcela.valorParcela);

                    return (
                      <TableRow
                        key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell className={cellClassName}>
                          <div className="flex justify-center">
                            <span className="inline-flex rounded-sm bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              #{parcela.numeroParcela}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className={`${cellClassName} text-slate-600`}>
                          {formatDate(parcela.dataVencimento)}
                        </TableCell>

                        <TableCell
                          className={`${cellClassName} font-semibold text-slate-700`}
                        >
                          {formatCurrency(valorParcela)}
                        </TableCell>

                        <TableCell className={cellClassName}>
                          <div className="flex justify-center">
                            <Badge
                              variant="outline"
                              className={`rounded-sm px-2 py-0 text-[10px] ${getStatusBadgeClassName(
                                parcela.status
                              )}`}
                            >
                              {parcela.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}