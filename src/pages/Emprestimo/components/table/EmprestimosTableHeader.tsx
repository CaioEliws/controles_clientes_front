import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";

type Props = {
  selectedClienteName?: string | null;
};

export function EmprestimosTableHeader({ selectedClienteName }: Props) {
  return (
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="whitespace-nowrap">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                Cliente
                <Filter
                  className={`w-3.5 h-3.5 ${
                    selectedClienteName ? "text-blue-600" : "text-slate-400"
                  }`}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
                Selecionado
              </p>
              <p className="text-sm px-2 pb-1">{selectedClienteName ?? "Nenhum"}</p>
            </PopoverContent>
          </Popover>
        </TableHead>

        <TableHead className="whitespace-nowrap">Data</TableHead>
        <TableHead className="whitespace-nowrap">Forma</TableHead>
        <TableHead className="whitespace-nowrap">Emprestado</TableHead>
        <TableHead className="whitespace-nowrap">A receber</TableHead>
        <TableHead className="whitespace-nowrap">Parcela</TableHead>
        <TableHead className="whitespace-nowrap">Recebido</TableHead>
        <TableHead className="whitespace-nowrap">Total</TableHead>
        <TableHead className="whitespace-nowrap">Início</TableHead>
        <TableHead className="whitespace-nowrap">Final</TableHead>
        <TableHead className="whitespace-nowrap">Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}