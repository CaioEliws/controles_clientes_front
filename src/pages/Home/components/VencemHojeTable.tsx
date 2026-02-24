import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ParcelaTable } from "@/mappers/parcela.mapper";

interface Props {
  parcelas: ParcelaTable[];
  onPagar: (idEmprestimo: number, numeroParcela: number) => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function VencemHojeTable({
  parcelas,
  page = 1,
  totalPages = 1,
  totalItems,
  onPrev,
  onNext,
  onPagar,
}: Props) {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const displayTotalItems = totalItems !== undefined ? totalItems : parcelas.length;

  return (
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
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parcelas.length === 0 ? (
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

                  <TableCell>
                    {formatCurrency(parcela.valor)}
                  </TableCell>

                  <TableCell className="text-slate-600">
                    {new Date(parcela.dataVencimento).toLocaleDateString("pt-BR")}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                      onClick={() =>
                        onPagar(parcela.idEmprestimo, parcela.numeroParcela)
                      }
                    >
                      Marcar como Pago
                    </Button>
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
            Página {page} de {totalPages || 1} — {displayTotalItems} resultados
          </span>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={page === 1 || !onPrev} 
              onClick={onPrev}
            >
              Anterior
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              disabled={page === totalPages || !onNext} 
              onClick={onNext}
            >
              Próxima
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}