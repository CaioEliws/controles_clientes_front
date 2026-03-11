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
  selectedEmprestimoLabel?: string | null;
};

const PARCELAS_POR_BLOCO = 10;

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

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}

const headClassName =
  "text-center border-b border-r border-slate-200 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-slate-500 first:border-l";

const cellClassName =
  "text-center border-b border-r border-slate-100 px-3 py-2.5 text-[13px] align-middle first:border-l";

function ParcelasTableBlock({
  parcelas,
  label,
}: {
  parcelas: ParcelaResponse[];
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {label && (
        <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            {label}
          </span>
        </div>
      )}

      <Table className="w-full table-fixed">
        <TableHeader className="bg-slate-50/80">
          <TableRow className="hover:bg-slate-50/80">
            <TableHead className={`${headClassName} w-[20%]`}>
              Nº Parcela
            </TableHead>
            <TableHead className={`${headClassName} w-[30%]`}>
              Data
            </TableHead>
            <TableHead className={`${headClassName} w-[25%]`}>
              Valor
            </TableHead>
            <TableHead className={`${headClassName} w-[25%]`}>
              Situação
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {parcelas.map((parcela) => {
            const valorParcela = toNumberCurrency(parcela.valorParcela);

            return (
              <TableRow
                key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                className="transition-colors hover:bg-slate-50/60"
              >
                <TableCell className={cellClassName}>
                  <div className="flex justify-center">
                    <span className="inline-flex min-w-[58px] justify-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[12px] font-semibold text-slate-700">
                      #{parcela.numeroParcela}
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  className={`${cellClassName} text-slate-600 whitespace-normal break-words`}
                >
                  {formatDate(parcela.dataVencimento)}
                </TableCell>

                <TableCell
                  className={`${cellClassName} font-semibold text-slate-700 whitespace-normal break-words`}
                >
                  {formatCurrency(valorParcela)}
                </TableCell>

                <TableCell className={cellClassName}>
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className={`min-w-[102px] justify-center rounded-md px-2.5 py-0.5 text-[12px] font-semibold ${getStatusBadgeClassName(
                        parcela.status
                      )}`}
                    >
                      {parcela.status}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function RelatorioParcelasTable({
  loading,
  parcelas,
  selectedClienteName,
  selectedEmprestimoLabel,
}: Props) {
  const parcelasOrdenadas = [...parcelas].sort(
    (a, b) => a.numeroParcela - b.numeroParcela
  );

  const blocos = chunkArray(parcelasOrdenadas, PARCELAS_POR_BLOCO);
  const hasMultipleBlocks = blocos.length > 1;

  return (
    <section className="mt-4 min-w-0 max-w-full sm:mt-6">
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <CardTitle className="text-base font-semibold text-slate-800 sm:text-lg">
              Tabela de Parcelas
            </CardTitle>

            <CardDescription className="max-w-2xl text-sm text-slate-500">
              {selectedClienteName ? (
                <>
                  Visualizando as parcelas de{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedClienteName}
                  </span>
                  {selectedEmprestimoLabel && (
                    <>
                      {" "}
                      no empréstimo de{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedEmprestimoLabel}
                      </span>
                    </>
                  )}
                  .
                </>
              ) : (
                "Selecione um cliente e um empréstimo para visualizar as parcelas."
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {loading ? (
            <div className="px-4 py-10 text-center">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-sm font-medium text-slate-500">
                  Carregando parcelas...
                </span>
                <span className="text-xs text-slate-400">
                  Aguarde enquanto o relatório é carregado.
                </span>
              </div>
            </div>
          ) : parcelasOrdenadas.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-sm font-medium text-slate-500">
                  Nenhuma parcela encontrada
                </span>
                <span className="text-xs text-slate-400">
                  Este empréstimo não possui parcelas disponíveis para exibição.
                </span>
              </div>
            </div>
          ) : hasMultipleBlocks ? (
            <div className="mx-auto max-w-[1100px]">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {blocos.map((bloco, index) => (
                  <ParcelasTableBlock
                    key={index}
                    parcelas={bloco}
                    label={`Parcelas ${bloco[0]?.numeroParcela} a ${bloco[bloco.length - 1]?.numeroParcela}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[760px]">
              <ParcelasTableBlock parcelas={parcelasOrdenadas} />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}