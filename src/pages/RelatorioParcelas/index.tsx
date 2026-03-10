import { RelatorioParcelasTable } from "@/pages/RelatorioParcelas/components/RelatorioParcelasTable";
import { useRelatorioParcelasPage } from "@/hooks/useRelatorioParcelasPage";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClienteAutoComplete } from "@/components/ClienteAutoComplete";
import { Search, X } from "lucide-react";

export function RelatorioParcelas() {
  const vm = useRelatorioParcelasPage();

  const hasFilters =
    !!vm.clientSearch || !!vm.selectedClienteId || !!vm.selectedEmprestimoId;

  return (
    <div className="min-w-0 max-w-full space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8 print:p-0">
      <section className="space-y-2 print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Relatório de Parcelas
        </h1>

        <p className="max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
          Selecione um cliente, escolha um empréstimo e gere uma tabela limpa
          com todas as parcelas para compartilhar ou imprimir.
        </p>
      </section>

      <div className="print:hidden">
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <CardContent className="overflow-visible p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Filtros e ações
                </h2>
                <p className="text-sm text-slate-400">
                  Escolha o cliente e o empréstimo para montar o relatório das
                  parcelas.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="isolate grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.25fr)_minmax(0,1.1fr)] xl:items-end">
                  <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Buscar cliente
                    </label>

                    <div className="relative z-30">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <ClienteAutoComplete
                        value={vm.clientSearch}
                        error={vm.clientSearchError}
                        suggestions={vm.suggestions}
                        onChange={vm.handleClientSearchChange}
                        onSelect={vm.selectCliente}
                      />
                    </div>

                    {vm.clientSearchError && (
                      <p className="mt-2 text-xs text-red-600">
                        {vm.clientSearchError}
                      </p>
                    )}
                  </div>

                  <div className="relative z-0 min-w-0">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cliente selecionado
                    </label>

                    <select
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400"
                      value={vm.selectedClienteId ?? ""}
                      onChange={(e) =>
                        vm.handleSelectCliente(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">Selecione um cliente</option>
                      {vm.clientesFiltrados.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative z-0 min-w-0">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Empréstimo selecionado
                    </label>

                    <select
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      value={vm.selectedEmprestimoId ?? ""}
                      onChange={(e) =>
                        vm.setSelectedEmprestimoId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      disabled={!vm.selectedClienteId || vm.loadingEmprestimos}
                    >
                      <option value="">
                        {vm.loadingEmprestimos
                          ? "Carregando empréstimos..."
                          : "Selecione um empréstimo"}
                      </option>

                      {vm.emprestimos.map((emprestimo) => (
                        <option key={emprestimo.id} value={emprestimo.id}>
                          {emprestimo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 xl:flex-row xl:items-stretch xl:justify-between">
                  <div className="min-w-0 xl:max-w-[520px] xl:flex-1">
                    {vm.selectedClienteName ? (
                      <div className="flex min-h-[64px] flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Cliente atual
                        </p>
                        <p className="truncate text-sm font-medium text-slate-700">
                          {vm.selectedClienteName}
                        </p>
                        {vm.selectedEmprestimoLabel && (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {vm.selectedEmprestimoLabel}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex min-h-[64px] items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
                        <p className="text-sm text-slate-400">
                          Nenhum cliente ou empréstimo selecionado.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-2 xl:ml-auto xl:max-w-[760px] xl:flex-row xl:justify-end">
                    {hasFilters && (
                      <div className="w-full xl:w-[220px]">
                        <Button
                          variant="ghost"
                          onClick={vm.clearFilters}
                          className="h-[64px] w-full rounded-xl border border-red-100 px-3 text-red-500 whitespace-nowrap hover:bg-red-50 hover:text-red-600"
                          type="button"
                        >
                          <X className="mr-2 h-4 w-4 shrink-0" />
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="print:block">
        <RelatorioParcelasTable
          loading={vm.loadingParcelas}
          parcelas={vm.parcelas}
          selectedClienteName={vm.selectedClienteName}
        />
      </div>
    </div>
  );
}