import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useParcelas } from "@/hooks/useParcelas";
import { useParcelasFiltradas } from "@/hooks/useParcelasFiltradas";
import { ParcelasHeader } from "@/pages/Parcelas/components/ParcelasHeader";
import { ParcelasStats } from "@/pages/Parcelas/components/ParcelasStats";
import { ParcelasTable } from "@/pages/Parcelas/components/ParcelasTable";
import { ParcelasPagination } from "@/pages/Parcelas/components/ParcelasPagination";
import { PagarParcelaDialog } from "@/pages/Parcelas/components/PagarParcelaDialog";
import { AlterarDataParcelaDialog } from "@/pages/Parcelas/components/AlterarDataParcelaDialog";
import type { StatusParcela, ParcelaResponse } from "@/types";

const ITEMS_PER_PAGE = 10;

type ParcelaSelecionada = {
  idEmprestimo: number;
  numeroParcela: number;
  valorRestante: number;
  dataVencimento: string;
};

export function Parcelas() {
  const { parcelas, loading, fetchParcelas } = useParcelas();
  const [searchParams] = useSearchParams();

  // ✅ pegar query params
  const clienteParam = searchParams.get("cliente");
  const emprestimoIdParam = searchParams.get("emprestimoId");
  const emprestimoId = emprestimoIdParam
    ? Number(emprestimoIdParam)
    : null;

  const [selected, setSelected] = useState<ParcelaSelecionada | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alterarDialogOpen, setAlterarDialogOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>(
    clienteParam ? [clienteParam] : []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<StatusParcela[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ✅ Filtro automático por empréstimo
  const parcelasBase = useMemo(() => {
    if (!emprestimoId) return parcelas;
    return parcelas.filter(
      (p) => p.idEmprestimo === emprestimoId
    );
  }, [parcelas, emprestimoId]);

  const mapParcelaToSelecionada = (
    p: ParcelaResponse
  ): ParcelaSelecionada => ({
    idEmprestimo: p.idEmprestimo,
    numeroParcela: p.numeroParcela,
    valorRestante: p.valorParcela - (p.valorPago || 0),
    dataVencimento: p.dataVencimento,
  });

  const toggleClient = (client: string) => {
    setSelectedClients((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
    setPage(1);
  };

  const toggleStatus = (status: StatusParcela) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const uniqueClients = useMemo(() => {
    return [
      ...new Set(
        parcelasBase
          .map((p) => p.nomeCliente)
          .filter((nome): nome is string => Boolean(nome))
      ),
    ];
  }, [parcelasBase]);

  const { filtradas, totalAtrasadas, vencendoEstaSemana } =
    useParcelasFiltradas({
      parcelas: parcelasBase, // ✅ aqui usamos parcelas já filtradas pelo empréstimo
      search,
      selectedClients,
      selectedStatuses,
      selectedMonth,
      sortOrder,
    });

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE);

  const paginated = filtradas.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <main className="flex-1 p-8 space-y-8">

        <ParcelasHeader
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          hasFilters={
            !!search ||
            selectedClients.length > 0 ||
            selectedStatuses.length > 0 ||
            selectedMonth !== "ALL"
          }
          onClearFilters={() => {
            setSearch("");
            setSelectedClients([]);
            setSelectedStatuses([]);
            setSelectedMonth("ALL");
            setSortOrder("asc");
            setPage(1);
          }}
        />

        <ParcelasStats
          total={filtradas.length}
          atrasadas={totalAtrasadas}
          vencendoSemana={vencendoEstaSemana}
        />

        <ParcelasTable
          loading={loading}
          parcelas={paginated}
          uniqueClients={uniqueClients}
          selectedClients={selectedClients}
          selectedStatuses={selectedStatuses}
          selectedMonth={selectedMonth}
          toggleClient={toggleClient}
          toggleStatus={toggleStatus}
          setSelectedMonth={(value) => {
            setSelectedMonth(value);
            setPage(1);
          }}
          setSortOrder={(value) => {
            setSortOrder(value);
            setPage(1);
          }}
          onPagar={(p) => {
            setSelected({
              idEmprestimo: p.idEmprestimo,
              numeroParcela: p.numeroParcela,
              valorRestante: p.valorRestante,
              dataVencimento: "",
            });
            setDialogOpen(true);
          }}
          onAlterarData={(parcela) => {
            setSelected(mapParcelaToSelecionada(parcela));
            setAlterarDialogOpen(true);
          }}
        />

        <ParcelasPagination
          page={page}
          totalPages={totalPages}
          totalItems={filtradas.length}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      </main>

      {selected && (
        <PagarParcelaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          idEmprestimo={selected.idEmprestimo}
          numeroParcela={selected.numeroParcela}
          valorParcela={selected.valorRestante}
          onSuccess={fetchParcelas}
        />
      )}

      {selected && (
        <AlterarDataParcelaDialog
          open={alterarDialogOpen}
          onOpenChange={setAlterarDialogOpen}
          idEmprestimo={selected.idEmprestimo}
          numeroParcela={selected.numeroParcela}
          dataAtual={selected.dataVencimento}
          onSuccess={fetchParcelas}
        />
      )}
    </div>
  );
}