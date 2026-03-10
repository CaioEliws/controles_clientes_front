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
import { Filter, ChevronDown, ArrowUpDown, Calendar } from "lucide-react";

import type { ParcelaResponse, StatusParcela } from "@/types";
import { MESES } from "@/hooks/useParcelasFiltradas";
import { formatCurrency, formatDate } from "@/utils/format";

import { PagarParcelaButton } from "@/components/actions/PagarParcelaButton";
import { AlterarParcelaButton } from "@/components/actions/AlterarParcelaButton";

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
}

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
}: Props) {
  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[250px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 transition-colors hover:text-slate-900">
                      Cliente
                      <Filter
                        className={`h-3.5 w-3.5 ${
                          selectedClients.length > 0
                            ? "fill-blue-600 text-blue-600"
                            : ""
                        }`}
                      />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-2">
                      <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Filtrar Clientes
                      </p>

                      <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                        {uniqueClients.map((client) => (
                          <div
                            key={client}
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-50"
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

              <TableHead>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 transition-colors hover:text-slate-900">
                      Vencimento <Calendar className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="px-2 text-[10px] font-bold uppercase text-slate-500">
                          Ordenação
                        </p>

                        <button
                          type="button"
                          className="w-full rounded-md p-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => setSortOrder("desc")}
                        >
                          <ArrowUpDown className="mr-2 inline h-3.5 w-3.5" />
                          Mais Antigos
                        </button>

                        <button
                          type="button"
                          className="w-full rounded-md p-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => setSortOrder("asc")}
                        >
                          <ArrowUpDown className="mr-2 inline h-3.5 w-3.5 rotate-180" />
                          Mais Recentes
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="px-2 text-[10px] font-bold uppercase text-slate-500">
                          Filtrar por Mês
                        </p>

                        <select
                          className="w-full rounded-md border bg-white p-1 text-sm"
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
                    <button className="flex items-center gap-2 transition-colors hover:text-slate-900">
                      Status <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 p-2" align="start">
                    {(
                      ["PENDENTE", "ATRASADO", "PAGO", "PARCIAL"] as StatusParcela[]
                    ).map((s) => (
                      <div
                        key={s}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-50"
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
                <TableCell colSpan={7} className="py-20 text-center text-slate-400">
                  Carregando dados...
                </TableCell>
              </TableRow>
            ) : parcelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-slate-400">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              parcelas.map((p) => {
                const valorParcela = toNumberCurrency(p.valorParcela);
                const valorPago = toNumberCurrency(p.valorPago);

                return (
                  <TableRow
                    key={`${p.idEmprestimo}-${p.numeroParcela}`}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {p.nomeCliente}
                    </TableCell>

                    <TableCell className="font-medium text-slate-500">
                      #{p.numeroParcela}
                    </TableCell>

                    <TableCell>{formatCurrency(valorParcela)}</TableCell>

                    <TableCell className="font-bold text-emerald-600">
                      {formatCurrency(valorPago)}
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {formatDate(p.dataVencimento)}
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
                          <AlterarParcelaButton
                            onClick={() => onAlterarParcela(p)}
                          />
                          <PagarParcelaButton onClick={() => onPagar(p)} />
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