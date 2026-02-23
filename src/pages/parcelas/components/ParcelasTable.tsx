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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, ChevronDown, ArrowUpDown, Calendar } from "lucide-react";
import type { ParcelaResponse, StatusParcela } from "@/types";
import { MESES } from "@/hooks/useParcelasFiltradas";

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

              {/* CLIENTE */}
              <TableHead className="w-[250px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Cliente
                      <Filter className={`w-3.5 h-3.5 ${selectedClients.length > 0 ? "text-blue-600 fill-blue-600" : ""}`} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                        Filtrar Clientes
                      </p>

                      <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                        {uniqueClients.map(client => (
                          <div
                            key={client}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                            onClick={() => toggleClient(client)}
                          >
                            <Checkbox checked={selectedClients.includes(client)} />
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

              {/* VENCIMENTO */}
              <TableHead>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Vencimento
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-3">

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 px-2 uppercase">
                          Ordenação
                        </p>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start font-normal"
                          onClick={() => setSortOrder("desc")}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                          Mais Antigos
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start font-normal"
                          onClick={() => setSortOrder("asc")}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 mr-2 rotate-180" />
                          Mais Recentes
                        </Button>
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

              {/* STATUS */}
              <TableHead>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                      Status
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="space-y-1">
                      {(["PENDENTE","ATRASADO","PAGO","PARCIAL"] as StatusParcela[]).map(s => (
                        <div
                          key={s}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                          onClick={() => toggleStatus(s)}
                        >
                          <Checkbox checked={selectedStatuses.includes(s)} />
                          <span className="text-sm font-medium">{s}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                  Carregando dados...
                </TableCell>
              </TableRow>
            ) : parcelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              parcelas.map((p) => {
                const valorPagoAcumulado = p.valorPago || 0;
                const valorRestante = p.valorParcela - valorPagoAcumulado;

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
                      {formatCurrency(valorPagoAcumulado)}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {new Date(p.dataVencimento).toLocaleDateString("pt-BR")}
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
                        className={
                          p.status === "PARCIAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {p.status !== "PAGO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                          onClick={() =>
                            onPagar({
                              idEmprestimo: p.idEmprestimo,
                              numeroParcela: p.numeroParcela,
                              valorRestante,
                            })
                          }
                        >
                          Pagar
                        </Button>
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