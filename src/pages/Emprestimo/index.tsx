import { NovoEmprestimoDialog } from "@/pages/Emprestimo/components/NovoEmprestimoDialog";
import { EmprestimosTable } from "@/pages/Emprestimo/components/EmprestimosTable";
import { ModalRelatorio } from "@/components/ModalRelatorio";
import { useEmprestimosPage } from "@/hooks/useEmprestimoPage";

import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ClienteAutoComplete } from "@/components/ClienteAutoComplete";

export function Emprestimo() {
  const vm = useEmprestimosPage();

  return (
    <div className="p-6 overflow-x-hidden">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-semibold">Empréstimos</h1>
        <p className="text-sm text-slate-500">
          Selecione um cliente para listar os empréstimos.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative space-y-1">
            <Search className="absolute left-3 top-5 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ClienteAutoComplete
              value={vm.clientSearch}
              error={vm.clientSearchError}
              suggestions={vm.suggestions}
              onChange={vm.handleClientSearchChange}
              onSelect={vm.selectCliente}
            />
            {vm.clientSearchError && (
              <p className="text-xs text-red-600">{vm.clientSearchError}</p>
            )}
          </div>

          <select
            className="h-10 w-full sm:w-[320px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
            value={vm.selectedCliente ?? ""}
            onChange={(e) =>
              vm.handleSelectCliente(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Selecione um cliente</option>
            {vm.clientesFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            className="h-10 w-full sm:w-[200px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
            value={vm.sortOrder}
            onChange={(e) => vm.setSortOrder(e.target.value as "asc" | "desc")}
            disabled={!vm.selectedCliente}
          >
            <option value="asc">Mais antigos</option>
            <option value="desc">Mais recentes</option>
          </select>

          {(!!vm.clientSearch || !!vm.selectedCliente) && (
            <Button
              variant="ghost"
              onClick={vm.clearSearch}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              type="button"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {vm.selectedCliente && vm.selectedClienteName && (
            <ModalRelatorio
              clienteId={vm.selectedCliente}
              nomeCliente={vm.selectedClienteName}
            />
          )}

          <NovoEmprestimoDialog
            disabled={!vm.selectedCliente}
            selectedClienteId={vm.selectedCliente}
            selectedClienteName={vm.selectedClienteName}
            onCreated={vm.refetch}
          />
        </div>
      </div>

      <EmprestimosTable
        loading={vm.loading}
        emprestimos={vm.emprestimos}
        selectedClienteName={vm.selectedClienteName}
        selectedClienteId={vm.selectedCliente}
        onOpenParcelas={vm.openParcelas}
        onRefetch={vm.refetch}
      />
    </div>
  );
}