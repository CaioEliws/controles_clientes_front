import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { parcelasSearchSchema } from "@/schemas/parcelas.schema";

import { ParcelasHeader } from "@/pages/Parcelas/components/ParcelasHeader";
import { ParcelasStats } from "@/pages/Parcelas/components/ParcelasStats";
import { ParcelasTable } from "@/pages/Parcelas/components/table/ParcelasTable";
import { ParcelasPagination } from "@/pages/Parcelas/components/ParcelasPagination";
import { PagarParcelaDialog } from "@/pages/Parcelas/components/dialogs/PagarParcelaDialog";
import { AlterarParcelaDialog } from "@/components/AlterarParcelaDialog";
import { DesfazerPagamentoDialog } from "@/pages/Parcelas/components/dialogs/DesfazerPagamentoDialog";
import { ParcelasSkeleton } from "@/pages/Parcelas/components/ParcelasSkeleton";
import { useParcelasPage } from "@/hooks/useParcelasPage";

export function Parcelas() {
  const vm = useParcelasPage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchError, setSearchError] = useState<string | null>(null);

  const { setSearch, setPage } = vm;

  useEffect(() => {
    const cliente = searchParams.get("cliente") ?? "";
    setSearch(cliente);
    setPage(1);
  }, [searchParams, setSearch, setPage]);

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

  const handleClearFilters = () => {
    setSearchError(null);
    vm.clearFilters();
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 space-y-8 p-8 min-w-0">
        {vm.loading ? (
          <ParcelasSkeleton />
        ) : (
          <>
            <ParcelasHeader
              search={vm.search}
              searchError={searchError}
              onSearchChange={handleSearchChange}
              hasFilters={vm.hasFilters}
              onClearFilters={handleClearFilters}
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
              onAlterarParcela={vm.openAlterarParcela}
              onDesfazerPagamento={vm.openDesfazerPagamento}
            />

            <ParcelasPagination
              page={vm.page}
              totalPages={vm.totalPages}
              totalItems={vm.filtradas.length}
              onPrev={vm.goToPrevPage}
              onNext={vm.goToNextPage}
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
          valorParcela={vm.selected.valorParcela}
          valorPago={vm.selected.valorPago}
          status={vm.selected.status}
          onSuccess={vm.fetchParcelas}
        />
      )}

      {vm.selected && (
        <DesfazerPagamentoDialog
          open={vm.desfazerDialogOpen}
          onOpenChange={vm.setDesfazerDialogOpen}
          idEmprestimo={vm.selected.idEmprestimo}
          numeroParcela={vm.selected.numeroParcela}
          onSuccess={vm.handleDesfazerPagamentoSuccess}
        />
      )}

      {vm.selected && (
        <AlterarParcelaDialog
          open={vm.alterarDialogOpen}
          onOpenChange={vm.setAlterarDialogOpen}
          idEmprestimo={vm.selected.idEmprestimo}
          numeroParcela={vm.selected.numeroParcela}
          dataAtual={vm.selected.dataVencimento}
          valorAtual={vm.selected.valorParcela}
          onSuccess={vm.fetchParcelas}
        />
      )}
    </div>
  );
}