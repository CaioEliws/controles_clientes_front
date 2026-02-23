import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function ParcelasHeader({
  search,
  onSearchChange,
  hasFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">
          Gestão de Parcelas
        </h1>
        <p className="text-slate-500">
          Visualize e controle os recebimentos dos seus clientes.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            className="pl-10 w-72 bg-white"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}