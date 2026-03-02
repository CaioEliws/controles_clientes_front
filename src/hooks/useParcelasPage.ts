import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useParcelas } from "@/hooks/useParcelas";
import { useParcelasFiltradas } from "@/hooks/useParcelasFiltradas";
import type { ParcelaResponse, StatusParcela } from "@/types";

const ITEMS_PER_PAGE = 10;

export type ParcelaSelecionada = {
  idEmprestimo: number;
  numeroParcela: number;
  valorRestante: number;
  dataVencimento: string;
};

export function useParcelasPage() {
  const { parcelas, loading, fetchParcelas } = useParcelas();
  const [searchParams] = useSearchParams();

  const clienteParam = searchParams.get("cliente");
  const emprestimoIdParam = searchParams.get("emprestimoId");
  const emprestimoId = emprestimoIdParam ? Number(emprestimoIdParam) : null;

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

  const parcelasBase = useMemo(() => {
    if (!emprestimoId) return parcelas;
    return parcelas.filter((p) => p.idEmprestimo === emprestimoId);
  }, [parcelas, emprestimoId]);

  const uniqueClients = useMemo(() => {
    return [
      ...new Set(
        parcelasBase
          .map((p) => p.nomeCliente)
          .filter((nome): nome is string => Boolean(nome))
      ),
    ];
  }, [parcelasBase]);

  const { filtradas, totalAtrasadas, vencendoEstaSemana } = useParcelasFiltradas({
    parcelas: parcelasBase,
    search,
    selectedClients,
    selectedStatuses,
    selectedMonth,
    sortOrder,
  });

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE);

  const paginated = useMemo(() => {
    return filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [filtradas, page]);

  const hasFilters =
    !!search ||
    selectedClients.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedMonth !== "ALL";

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedClients([]);
    setSelectedStatuses([]);
    setSelectedMonth("ALL");
    setSortOrder("asc");
    setPage(1);
  }, []);

  const toggleClient = useCallback((client: string) => {
    setSelectedClients((prev) =>
      prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
    );
    setPage(1);
  }, []);

  const toggleStatus = useCallback((status: StatusParcela) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  }, []);

  const mapParcelaToSelecionada = useCallback(
    (p: ParcelaResponse): ParcelaSelecionada => ({
      idEmprestimo: p.idEmprestimo,
      numeroParcela: p.numeroParcela,
      valorRestante: p.valorParcela - (p.valorPago || 0),
      dataVencimento: p.dataVencimento,
    }),
    []
  );

  const openPagar = useCallback((p: { idEmprestimo: number; numeroParcela: number; valorRestante: number }) => {
    setSelected({ idEmprestimo: p.idEmprestimo, numeroParcela: p.numeroParcela, valorRestante: p.valorRestante, dataVencimento: "" });
    setDialogOpen(true);
  }, []);

  const openAlterarData = useCallback(
    (parcela: ParcelaResponse) => {
      setSelected(mapParcelaToSelecionada(parcela));
      setAlterarDialogOpen(true);
    },
    [mapParcelaToSelecionada]
  );

  return {
    loading,
    fetchParcelas,

    search,
    setSearch,
    page,
    setPage,
    selectedClients,
    selectedStatuses,
    selectedMonth,
    sortOrder,
    setSelectedMonth,
    setSortOrder,

    uniqueClients,
    filtradas,
    paginated,
    totalPages,
    totalAtrasadas,
    vencendoEstaSemana,

    hasFilters,
    clearFilters,
    toggleClient,
    toggleStatus,

    selected,
    dialogOpen,
    setDialogOpen,
    alterarDialogOpen,
    setAlterarDialogOpen,
    openPagar,
    openAlterarData,
  };
}