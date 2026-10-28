import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface Props {
  search: string;
  searchError?: string | null;
  onSearchChange: (value: string) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function ParcelasHeader({
  search,
  searchError,
  onSearchChange,
  hasFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-end">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-slate-900">Gestão de Parcelas</h1>
        <p className="text-sm leading-6 text-slate-500">
          Visualize e controle os recebimentos dos seus clientes.
        </p>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-11 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}

        <div className="relative w-full space-y-1 sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-[22px] -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            aria-label="Buscar cliente"
            placeholder="Buscar pelo nome do cliente"
            value={search}
            className={`h-11 w-full rounded-xl border-slate-200 bg-white pl-10 shadow-sm sm:w-80 lg:w-96 ${searchError ? "border-red-500" : ""}`}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchError && <p className="text-xs text-red-600">{searchError}</p>}
        </div>
      </div>
    </div>
  );
}