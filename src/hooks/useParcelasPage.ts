import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useParcelas } from "@/hooks/useParcelas";
import { useParcelasFiltradas } from "@/hooks/useParcelasFiltradas";
import type { ParcelaResponse, StatusParcela } from "@/types";
import { toIsoDateString, toNumber } from "@/utils/normalize";

const ITEMS_PER_PAGE = 10;

export type ParcelaSelecionada = {
  idEmprestimo: number;
  numeroParcela: number;
  valorParcela: number;
  valorPago: number;
  valorRestante: number;
  dataVencimento: string;
  status: StatusParcela;
};

export function useParcelasPage() {
  const { parcelas, loading, fetchParcelas } = useParcelas();
  const [searchParams] = useSearchParams();

  const clienteParam = searchParams.get("cliente") ?? "";
  const emprestimoIdParam = searchParams.get("emprestimoId");
  const emprestimoId = emprestimoIdParam ? Number(emprestimoIdParam) : null;

  const [selected, setSelected] = useState<ParcelaSelecionada | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alterarDialogOpen, setAlterarDialogOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(clienteParam);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
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

  const { filtradas, totalAtrasadas, vencendoEstaSemana } =
    useParcelasFiltradas({
      parcelas: parcelasBase,
      search,
      selectedClients,
      selectedStatuses,
      selectedMonth,
      sortOrder,
    });

  const totalPages = Math.max(1, Math.ceil(filtradas.length / ITEMS_PER_PAGE));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filtradas.slice(start, end);
  }, [filtradas, page, totalPages]);

  const hasFilters =
    !!search ||
    selectedClients.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedMonth !== "ALL" ||
    sortOrder !== "asc";

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedClients([]);
    setSelectedStatuses([]);
    setSelectedMonth("ALL");
    setSortOrder("asc");
    setPage(1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const toggleClient = useCallback((client: string) => {
    setSelectedClients((prev) =>
      prev.includes(client)
        ? prev.filter((c) => c !== client)
        : [...prev, client]
    );
    setPage(1);
  }, []);

  const toggleStatus = useCallback((status: StatusParcela) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPage(1);
  }, []);

  const mapParcelaToSelecionada = useCallback(
    (p: ParcelaResponse): ParcelaSelecionada => {
      const valorParcela = toNumber(p.valorParcela);
      const valorPago = toNumber(p.valorPago);
      const valorRestante = Math.max(0, valorParcela - valorPago);

      return {
        idEmprestimo: p.idEmprestimo,
        numeroParcela: p.numeroParcela,
        valorParcela,
        valorPago,
        valorRestante,
        dataVencimento: toIsoDateString(p.dataVencimento),
        status: p.status,
      };
    },
    []
  );

  const openPagar = useCallback(
    (parcela: ParcelaResponse) => {
      setSelected(mapParcelaToSelecionada(parcela));
      setDialogOpen(true);
    },
    [mapParcelaToSelecionada]
  );

  const openAlterarParcela = useCallback(
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
    setSelectedClients,
    selectedStatuses,
    setSelectedStatuses,
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
    goToPrevPage,
    goToNextPage,

    selected,
    dialogOpen,
    setDialogOpen,
    alterarDialogOpen,
    setAlterarDialogOpen,
    openPagar,
    openAlterarParcela,
  };
}