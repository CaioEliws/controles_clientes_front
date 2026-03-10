import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlterarParcelaButton } from "@/components/actions/AlterarParcelaButton";
import { AlterarParcelaDialog } from "@/components/AlterarParcelaDialog";
import type { ParcelaTable } from "@/mappers/parcela.mapper";

interface Props {
  parcelas: ParcelaTable[];
  page: number;
  onPrev: () => void;
  onNext: () => void;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

function safeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getDiasAtraso(parcela: ParcelaTable) {
  const vencimento = safeDate(parcela.dataVencimento);
  if (!vencimento) return 0;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const venc = new Date(vencimento);
  venc.setHours(0, 0, 0, 0);

  const diffMs = hoje.getTime() - venc.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(diffDias, 0);
}

function getCliente(parcela: ParcelaTable) {
  return parcela.cliente || "Cliente não informado";
}

function getValor(parcela: ParcelaTable) {
  if (typeof parcela.valor === "number") return parcela.valor;
  return 0;
}

export function AtrasadasTable({
  parcelas = [],
  page,
  onPrev,
  onNext,
  onRefresh,
  loading = false,
}: Props) {
  const [selected, setSelected] = useState<ParcelaTable | null>(null);
  const [alterarOpen, setAlterarOpen] = useState(false);

  const formatCurrency = (val: number) =>
    (val ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const ITEMS_PER_PAGE = 20;
  const totalRegistros = parcelas.length;
  const totalPaginasCalculado = Math.ceil(totalRegistros / ITEMS_PER_PAGE);

  const validPage =
    Number.isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page);
  const currentPage = Math.min(validPage, totalPaginasCalculado || 1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const parcelasPaginadas = parcelas.slice(startIndex, endIndex);

  return (
    <>
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b bg-slate-50 px-8 py-6">
            <h3 className="text-lg font-semibold text-red-600">
              Parcelas Atrasadas
            </h3>
          </div>

          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Dias</TableHead>
                <TableHead className="text-center">Valor</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[220px]" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-[40px]" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-[90px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-[90px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-10" />
                    </TableCell>
                  </TableRow>
                ))
              ) : parcelasPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-16 text-center text-slate-400"
                  >
                    Nenhuma parcela encontrada para esta página.
                  </TableCell>
                </TableRow>
              ) : (
                parcelasPaginadas.map((parcela) => (
                  <TableRow
                    key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {getCliente(parcela)}
                    </TableCell>

                    <TableCell className="text-center font-medium text-red-600">
                      {getDiasAtraso(parcela)}
                    </TableCell>

                    <TableCell className="text-center">
                      {formatCurrency(getValor(parcela))}
                    </TableCell>

                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                      >
                        ATRASADO
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AlterarParcelaButton
                          onClick={() => {
                            setSelected(parcela);
                            setAlterarOpen(true);
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Página {currentPage} de {totalPaginasCalculado || 1} —{" "}
            {totalRegistros} resultados
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={loading || currentPage <= 1}
              onClick={onPrev}
            >
              Anterior
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={loading || currentPage >= totalPaginasCalculado}
              onClick={onNext}
            >
              Próxima
            </Button>
          </div>
        </CardFooter>
      </Card>

      {selected && (
        <AlterarParcelaDialog
          open={alterarOpen}
          onOpenChange={setAlterarOpen}
          idEmprestimo={selected.idEmprestimo}
          numeroParcela={selected.numeroParcela}
          dataAtual={selected.dataVencimento}
          valorAtual={getValor(selected)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}