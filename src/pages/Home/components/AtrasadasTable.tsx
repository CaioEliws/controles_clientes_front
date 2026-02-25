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

interface Parcela {
  cliente: string;
  diasAtraso: number;
  valor: number;
}

interface Props {
  parcelas: Parcela[];
  page: number;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean; // ✅ novo
}

export function AtrasadasTable({
  parcelas = [],
  page,
  onPrev,
  onNext,
  loading = false,
}: Props) {
  const formatCurrency = (val: number) =>
    (val ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const ITEMS_PER_PAGE = 20;
  const totalRegistros = parcelas.length;
  const totalPaginasCalculado = Math.ceil(totalRegistros / ITEMS_PER_PAGE);

  const validPage = Number.isNaN(Number(page)) || Number(page) < 1 ? 1 : Number(page);
  const currentPage = Math.min(validPage, totalPaginasCalculado || 1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const parcelasPaginadas = parcelas.slice(startIndex, endIndex);

  return (
    <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="px-8 py-6 border-b bg-slate-50">
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
                    <Skeleton className="h-4 w-[40px] mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-[90px] mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-[90px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : parcelasPaginadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-slate-400">
                  Nenhuma parcela encontrada para esta página.
                </TableCell>
              </TableRow>
            ) : (
              parcelasPaginadas.map((parcela, index) => (
                <TableRow
                  key={`${parcela.cliente}-${index}`}
                  className="hover:bg-slate-50/50"
                >
                  <TableCell className="font-semibold text-slate-700">
                    {parcela.cliente}
                  </TableCell>

                  <TableCell className="text-center font-medium text-red-600">
                    {parcela.diasAtraso}
                  </TableCell>

                  <TableCell className="text-center">
                    {formatCurrency(parcela.valor)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge variant="destructive">ATRASADO</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex justify-between items-center px-8 py-4 bg-slate-50/50 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Página {currentPage} de {totalPaginasCalculado || 1} — {totalRegistros} resultados
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
  );
}