import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Filter,
  ChevronDown,
  ArrowUpDown,
  Calendar,
} from "lucide-react";

import type { ParcelaResponse, StatusParcela } from "@/types";
import { MESES } from "@/hooks/useParcelasFiltradas";

import { PagarParcelaButton } from "@/components/actions/PagarParcelaButton";
import { AlterarDataParcelaButton } from "@/components/actions/AlterarDataParcelaButton";

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
  onPagar: (parcela: {
    idEmprestimo: number;
    numeroParcela: number;
    valorRestante: number;
  }) => void;
  onAlterarData: (parcela: ParcelaResponse) => void;
}

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
  onAlterarData,
}: Props) {
  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[250px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Cliente
                      <Filter
                        className={`w-3.5 h-3.5 ${
                          selectedClients.length > 0
                            ? "text-blue-600 fill-blue-600"
                            : ""
                        }`}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                        Filtrar Clientes
                      </p>
                      <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                        {uniqueClients.map((client) => (
                          <div
                            key={client}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                            onClick={() => toggleClient(client)}
                          >
                            <Checkbox
                              checked={selectedClients.includes(client)}
                            />
                            <span className="text-sm">{client}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead>Parcela</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Vl. Pago</TableHead>

              <TableHead>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Vencimento <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 px-2 uppercase">
                          Ordenação
                        </p>
                        <button
                          className="w-full text-left text-sm hover:bg-slate-50 p-2 rounded-md"
                          onClick={() => setSortOrder("desc")}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 inline mr-2" />
                          Mais Antigos
                        </button>
                        <button
                          className="w-full text-left text-sm hover:bg-slate-50 p-2 rounded-md"
                          onClick={() => setSortOrder("asc")}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 inline mr-2 rotate-180" />
                          Mais Recentes
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 px-2 uppercase">
                          Filtrar por Mês
                        </p>
                        <select
                          className="w-full text-sm border rounded-md p-1 bg-white"
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(
                              e.target.value === "ALL"
                                ? "ALL"
                                : Number(e.target.value)
                            )
                          }
                        >
                          <option value="ALL">Todos os meses</option>
                          {MESES.map((m, i) => (
                            <option key={i} value={i}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Status <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    {(
                      ["PENDENTE", "ATRASADO", "PAGO", "PARCIAL"] as StatusParcela[]
                    ).map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                        onClick={() => toggleStatus(s)}
                      >
                        <Checkbox checked={selectedStatuses.includes(s)} />
                        <span className="text-sm font-medium">{s}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-20 text-slate-400"
                >
                  Carregando dados...
                </TableCell>
              </TableRow>
            ) : parcelas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-20 text-slate-400"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              parcelas.map((p) => {
                const valorPago = p.valorPago || 0;
                const valorRestante = p.valorParcela - valorPago;

                return (
                  <TableRow
                    key={`${p.idEmprestimo}-${p.numeroParcela}`}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {p.nomeCliente}
                    </TableCell>

                    <TableCell className="text-slate-500 font-medium">
                      #{p.numeroParcela}
                    </TableCell>

                    <TableCell>
                      {formatCurrency(p.valorParcela)}
                    </TableCell>

                    <TableCell className="font-bold text-emerald-600">
                      {formatCurrency(valorPago)}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {new Date(
                        p.dataVencimento + "T00:00:00"
                      ).toLocaleDateString("pt-BR")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          p.status === "PAGO"
                            ? "default"
                            : p.status === "ATRASADO"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {p.status !== "PAGO" && (
                        <div className="flex justify-end gap-2">
                          <AlterarDataParcelaButton
                            onClick={() => onAlterarData(p)}
                          />
                          <PagarParcelaButton
                            onClick={() =>
                              onPagar({
                                idEmprestimo: p.idEmprestimo,
                                numeroParcela: p.numeroParcela,
                                valorRestante,
                              })
                            }
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}