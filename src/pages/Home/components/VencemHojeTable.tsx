import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PagarParcelaDialog } from "@/pages/Parcelas/components/PagarParcelaDialog";
import { AlterarDataParcelaDialog } from "@/pages/Parcelas/components/AlterarDataParcelaDialog";

import { PagarParcelaButton } from "@/components/actions/PagarParcelaButton";
import { AlterarDataParcelaButton } from "@/components/actions/AlterarDataParcelaButton";

import type { ParcelaTable } from "@/mappers/parcela.mapper";

interface Props {
  parcelas: ParcelaTable[];
  onRefresh: () => Promise<void>;
  loading?: boolean;

  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function VencemHojeTable({
  parcelas,
  onRefresh,
  loading = false,
  page = 1,
  totalPages = 1,
  totalItems,
  onPrev,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<ParcelaTable | null>(null);
  const [pagarOpen, setPagarOpen] = useState(false);
  const [alterarOpen, setAlterarOpen] = useState(false);

  const formatCurrency = (value: number) =>
    (value ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const displayTotalItems =
    totalItems !== undefined ? totalItems : parcelas.length;

  return (
    <>
      <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="px-8 py-6 border-b bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-700">
              Vencem Hoje
            </h3>
          </div>

          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
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
                    <TableCell>
                      <Skeleton className="h-4 w-[90px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-10" />
                        <Skeleton className="h-8 w-10" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : parcelas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-16 text-slate-400"
                  >
                    Nenhuma parcela vencendo hoje.
                  </TableCell>
                </TableRow>
              ) : (
                parcelas.map((parcela) => (
                  <TableRow
                    key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {parcela.cliente}
                    </TableCell>

                    <TableCell>{formatCurrency(parcela.valor)}</TableCell>

                    <TableCell className="text-slate-600">
                      {new Date(parcela.dataVencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AlterarDataParcelaButton
                          onClick={() => {
                            setSelected(parcela);
                            setAlterarOpen(true);
                          }}
                        />
                        <PagarParcelaButton
                          onClick={() => {
                            setSelected(parcela);
                            setPagarOpen(true);
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

        {(onNext || onPrev || displayTotalItems > 0) && (
          <CardFooter className="flex justify-between items-center px-8 py-4 bg-slate-50/50 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Página {page} de {totalPages} — {displayTotalItems} resultados
            </span>
          </CardFooter>
        )}
      </Card>

      {selected && (
        <>
          <PagarParcelaDialog
            open={pagarOpen}
            onOpenChange={setPagarOpen}
            idEmprestimo={selected.idEmprestimo}
            numeroParcela={selected.numeroParcela}
            valorParcela={selected.valor}
            onSuccess={onRefresh}
          />

          <AlterarDataParcelaDialog
            open={alterarOpen}
            onOpenChange={setAlterarOpen}
            idEmprestimo={selected.idEmprestimo}
            numeroParcela={selected.numeroParcela}
            dataAtual={selected.dataVencimento}
            onSuccess={onRefresh}
          />
        </>
      )}
    </>
  );
}