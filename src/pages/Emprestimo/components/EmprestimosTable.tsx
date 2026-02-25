import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";

import type { EmprestimoDetalhado } from "@/types";
import { EmprestimoStatusBadge } from "@/pages/Emprestimo/components/EmprestimoStatusBadge";
import { formatCurrency, formatDate } from "@/utils/format";

type Props = {
  loading?: boolean;
  emprestimos: EmprestimoDetalhado[];
  selectedClienteName?: string | null;

  // ✅ novo: ação ao clicar
  onOpenParcelas: (payload: { emprestimoId: number; cliente: string }) => void;
};

export function EmprestimosTable({
  loading,
  emprestimos,
  selectedClienteName,
  onOpenParcelas,
}: Props) {
  return (
    <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden mt-6">
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="min-w-[220px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                        Cliente
                        <Filter
                          className={`w-3.5 h-3.5 ${
                            selectedClienteName ? "text-blue-600 fill-blue-600" : ""
                          }`}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                        Selecionado
                      </p>
                      <p className="text-sm px-2 pb-1">
                        {selectedClienteName ?? "Nenhum"}
                      </p>
                    </PopoverContent>
                  </Popover>
                </TableHead>

                <TableHead className="min-w-[130px]">Data do empréstimo</TableHead>
                <TableHead className="min-w-[120px]">Forma Pgto</TableHead>
                <TableHead className="min-w-[140px]">Valor emprestado</TableHead>
                <TableHead className="min-w-[140px]">Valor a receber</TableHead>
                <TableHead className="min-w-[130px]">Valor parcela</TableHead>
                <TableHead className="min-w-[140px]">Valor recebido</TableHead>
                <TableHead className="min-w-[160px]">Valor total empréstimo</TableHead>
                <TableHead className="min-w-[130px]">Início pagamento</TableHead>
                <TableHead className="min-w-[130px]">Final pagamento</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-20 text-slate-400">
                    Carregando dados...
                  </TableCell>
                </TableRow>
              ) : emprestimos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-20 text-slate-400">
                    Nenhum empréstimo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                emprestimos.map((e) => (
                  <TableRow
                    key={e.id}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => onOpenParcelas({ emprestimoId: e.id, cliente: e.nomeCliente })}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        onOpenParcelas({ emprestimoId: e.id, cliente: e.nomeCliente });
                      }
                    }}
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {e.nomeCliente}
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {formatDate(e.dataEmprestimo)}
                    </TableCell>

                    <TableCell className="text-slate-600 font-medium">
                      {e.formaPagamento}
                    </TableCell>

                    <TableCell className="font-semibold">
                      {formatCurrency(e.valorEmprestado)}
                    </TableCell>

                    <TableCell className="text-emerald-600 font-bold">
                      {formatCurrency(e.valorAReceber)}
                    </TableCell>

                    <TableCell className="font-medium">
                      {formatCurrency(e.valorParcela)}
                    </TableCell>

                    <TableCell className="text-emerald-700 font-bold">
                      {formatCurrency(e.valorRecebido)}
                    </TableCell>

                    <TableCell className="font-semibold">
                      {formatCurrency(e.valorTotalEmprestimo)}
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {formatDate(e.inicioPagamento)}
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {formatDate(e.finalPagamento)}
                    </TableCell>

                    <TableCell>
                      <EmprestimoStatusBadge status={String(e.status)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}