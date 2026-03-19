import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";

import type { ParcelaResponse, StatusParcela } from "@/types";
import { ParcelasTableHeader } from "@/pages/Parcelas/components/table/ParcelasTableHeader";
import { ParcelasTableRow } from "@/pages/Parcelas/components/table/ParcelasTableRow";

interface Props {
  loading: boolean;
  parcelas: ParcelaResponse[];
  uniqueClients: string[];
  selectedClients: string[];
  selectedStatuses: StatusParcela[];
  selectedMonth: number | "ALL";
  toggleClient: (client: string) => void;
  toggleStatus: (status: StatusParcela) => void;
  setSelectedMonth: (value: number | "ALL") => void;
  setSortOrder: (value: "asc" | "desc") => void;
  onPagar: (parcela: ParcelaResponse) => void;
  onAlterarParcela: (parcela: ParcelaResponse) => void;
  onDesfazerPagamento: (parcela: ParcelaResponse) => void;
}

const TABLE_COLS = 7;

export function ParcelasTable({
  loading,
  parcelas,
  uniqueClients,
  selectedClients,
  selectedStatuses,
  selectedMonth,
  toggleClient,
  toggleStatus,
  setSelectedMonth,
  setSortOrder,
  onPagar,
  onAlterarParcela,
  onDesfazerPagamento,
}: Props) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[980px]">
            <Table className="w-full whitespace-nowrap text-sm">
              <ParcelasTableHeader
                uniqueClients={uniqueClients}
                selectedClients={selectedClients}
                selectedStatuses={selectedStatuses}
                selectedMonth={selectedMonth}
                toggleClient={toggleClient}
                toggleStatus={toggleStatus}
                setSelectedMonth={setSelectedMonth}
                setSortOrder={setSortOrder}
              />

              <TableBody>
                {loading ? (
                  <tr className="hover:bg-white">
                    <td colSpan={TABLE_COLS} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Carregando parcelas...
                        </span>
                        <span className="text-xs text-slate-400">
                          Aguarde enquanto os dados são carregados.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : parcelas.length === 0 ? (
                  <tr className="hover:bg-white">
                    <td colSpan={TABLE_COLS} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Nenhum resultado encontrado
                        </span>
                        <span className="text-xs text-slate-400">
                          Ajuste os filtros para visualizar outras parcelas.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parcelas.map((parcela) => (
                    <ParcelasTableRow
                      key={`${parcela.idEmprestimo}-${parcela.numeroParcela}`}
                      parcela={parcela}
                      onPagar={onPagar}
                      onAlterarParcela={onAlterarParcela}
                      onDesfazerPagamento={onDesfazerPagamento}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}