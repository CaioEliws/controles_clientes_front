import { useState } from "react";
import { parcelasSearchSchema } from "@/schemas/parcelas.schema";

import { ParcelasHeader } from "@/pages/Parcelas/components/ParcelasHeader";
import { ParcelasStats } from "@/pages/Parcelas/components/ParcelasStats";
import { ParcelasTable } from "@/pages/Parcelas/components/ParcelasTable";
import { ParcelasPagination } from "@/pages/Parcelas/components/ParcelasPagination";
import { PagarParcelaDialog } from "@/pages/Parcelas/components/PagarParcelaDialog";
import { AlterarDataParcelaDialog } from "@/pages/Parcelas/components/AlterarDataParcelaDialog";
import { ParcelasSkeleton } from "@/pages/Parcelas/components/ParcelasSkeleton";
import { useParcelasPage } from "@/hooks/useParcelasPage";

export function Parcelas() {
  const vm = useParcelasPage();

  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    const parsed = parcelasSearchSchema.safeParse(value);
    if (!parsed.success) {
      setSearchError(parsed.error.issues[0]?.message ?? "Busca inválida.");
      return;
    }
    setSearchError(null);
    vm.setSearch(parsed.data);
    vm.setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 p-8 space-y-8">
        {vm.loading ? (
          <ParcelasSkeleton />
        ) : (
          <>
            <ParcelasHeader
              search={vm.search}
              searchError={searchError}
              onSearchChange={handleSearchChange}
              hasFilters={vm.hasFilters}
              onClearFilters={() => {
                setSearchError(null);
                vm.clearFilters();
              }}
            />

            <ParcelasStats
              total={vm.filtradas.length}
              atrasadas={vm.totalAtrasadas}
              vencendoSemana={vm.vencendoEstaSemana}
            />

            <ParcelasTable
              loading={vm.loading}
              parcelas={vm.paginated}
              uniqueClients={vm.uniqueClients}
              selectedClients={vm.selectedClients}
              selectedStatuses={vm.selectedStatuses}
              selectedMonth={vm.selectedMonth}
              toggleClient={vm.toggleClient}
              toggleStatus={vm.toggleStatus}
              setSelectedMonth={(value) => {
                vm.setSelectedMonth(value);
                vm.setPage(1);
              }}
              setSortOrder={(value) => {
                vm.setSortOrder(value);
                vm.setPage(1);
              }}
              onPagar={vm.openPagar}
              onAlterarData={vm.openAlterarData}
            />

            <ParcelasPagination
              page={vm.page}
              totalPages={vm.totalPages}
              totalItems={vm.filtradas.length}
              onPrev={() => vm.setPage((p) => p - 1)}
              onNext={() => vm.setPage((p) => p + 1)}
            />
          </>
        )}
      </main>

      {vm.selected && (
        <PagarParcelaDialog
          open={vm.dialogOpen}
          onOpenChange={vm.setDialogOpen}
          idEmprestimo={vm.selected.idEmprestimo}
          numeroParcela={vm.selected.numeroParcela}
          valorParcela={vm.selected.valorRestante}
          onSuccess={vm.fetchParcelas}
        />
      )}

      {vm.selected && (
        <AlterarDataParcelaDialog
          open={vm.alterarDialogOpen}
          onOpenChange={vm.setAlterarDialogOpen}
          idEmprestimo={vm.selected.idEmprestimo}
          numeroParcela={vm.selected.numeroParcela}
          dataAtual={vm.selected.dataVencimento}
          onSuccess={vm.fetchParcelas}
        />
      )}
    </div>
  );
}