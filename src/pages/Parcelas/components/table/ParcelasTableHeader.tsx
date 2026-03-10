import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, ChevronDown, ArrowUpDown, Calendar } from "lucide-react";

import type { StatusParcela } from "@/types";
import { MESES } from "@/hooks/useParcelasFiltradas";

interface Props {
  uniqueClients: string[];
  selectedClients: string[];
  selectedStatuses: StatusParcela[];
  selectedMonth: number | "ALL";
  toggleClient: (client: string) => void;
  toggleStatus: (status: StatusParcela) => void;
  setSelectedMonth: (value: number | "ALL") => void;
  setSortOrder: (value: "asc" | "desc") => void;
}

const headButtonClassName =
  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-900";

const headClassName =
  "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500";

const STATUS_OPTIONS: StatusParcela[] = [
  "PENDENTE",
  "ATRASADO",
  "PAGO",
  "PARCIAL",
];

export function ParcelasTableHeader({
  uniqueClients,
  selectedClients,
  selectedStatuses,
  selectedMonth,
  toggleClient,
  toggleStatus,
  setSelectedMonth,
  setSortOrder,
}: Props) {
  return (
    <TableHeader className="bg-slate-50/90">
      <TableRow className="border-b border-slate-200 hover:bg-slate-50/90">
        <TableHead className={`${headClassName} w-[280px]`}>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={headButtonClassName}>
                <span>Cliente</span>
                <Filter
                  className={`h-3.5 w-3.5 ${
                    selectedClients.length > 0
                      ? "fill-blue-600 text-blue-600"
                      : "text-slate-400"
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-72 rounded-xl border border-slate-200 p-2 shadow-md"
              align="start"
            >
              <div className="space-y-2">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Filtrar clientes
                </p>

                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  {uniqueClients.map((client) => (
                    <button
                      key={client}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                      onClick={() => toggleClient(client)}
                    >
                      <Checkbox checked={selectedClients.includes(client)} />
                      <span className="truncate text-sm text-slate-700">
                        {client}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TableHead>

        <TableHead className={`${headClassName} w-[110px]`}>
          Parcela
        </TableHead>

        <TableHead className={`${headClassName} w-[160px]`}>
          Valor total
        </TableHead>

    <TableHead className={`${headClassName} w-[160px]`}>
          Vl. pago
        </TableHead>

        <TableHead className={`${headClassName} w-[170px]`}>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={headButtonClassName}>
                <span>Vencimento</span>
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-60 rounded-xl border border-slate-200 p-2 shadow-md"
              align="start"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Ordenação
                  </p>

                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setSortOrder("desc")}
                  >
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    Mais antigos
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setSortOrder("asc")}
                  >
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5 rotate-180" />
                    Mais recentes
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Filtrar por mês
                  </p>

                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
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
                    {MESES.map((mes, index) => (
                      <option key={index} value={index}>
                        {mes}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TableHead>

        <TableHead className={`${headClassName} w-[150px]`}>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={headButtonClassName}>
                <span>Status</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 ${
                    selectedStatuses.length > 0
                      ? "text-blue-600"
                      : "text-slate-400"
                  }`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-52 rounded-xl border border-slate-200 p-2 shadow-md"
              align="start"
            >
              <div className="space-y-1">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                    onClick={() => toggleStatus(status)}
                  >
                    <Checkbox checked={selectedStatuses.includes(status)} />
                    <span className="text-sm font-medium text-slate-700">
                      {status}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TableHead>

        <TableHead className={`${headClassName} w-[170px] text-right`}>
          Ações
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}