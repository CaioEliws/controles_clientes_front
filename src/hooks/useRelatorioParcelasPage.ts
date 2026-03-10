import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { clientesService } from "@/services/clientes.service";
import { emprestimosService } from "@/services/emprestimos.service";
import type {
  Cliente,
  EmprestimoDetalhado,
  ParcelaResponse,
  StatusParcela,
} from "@/types";
import { formatCurrency } from "@/utils/format";
import { z } from "zod";

const safeSearchRegex = /^[\p{L}\p{N}\s.'()-]*$/u;

const clienteSearchSchema = z
  .string()
  .max(60, "Pesquisa muito longa (máx 60 caracteres).")
  .refine(
    (s) => safeSearchRegex.test(s),
    "Use apenas letras/números e (.,'()-)."
  );

const normalize = (s?: string | null) =>
  (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const safeLower = (s?: string | null) => (s ?? "").trim().toLowerCase();

const safeDateMs = (value?: string | Date | null): number => {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

type RelatorioEmprestimoOption = {
  id: number;
  label: string;
};

const PARCELA_STATUSES: StatusParcela[] = [
  "PENDENTE",
  "PARCIAL",
  "PAGO",
  "ATRASADO",
];

export function useRelatorioParcelasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [emprestimosRaw, setEmprestimosRaw] = useState<EmprestimoDetalhado[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaResponse[]>([]);

  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [selectedEmprestimoId, setSelectedEmprestimoId] = useState<number | null>(
    null
  );

  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingEmprestimos, setLoadingEmprestimos] = useState(false);
  const [loadingParcelas, setLoadingParcelas] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;

    setLoadingClientes(true);

    clientesService
      .getAll()
      .then((data) => {
        if (!alive) return;
        setClientes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!alive) return;
        setClientes([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingClientes(false);
      });

    return () => {
      alive = false;

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const fetchEmprestimos = useCallback(async (clienteId: number) => {
    setLoadingEmprestimos(true);

    try {
      const data = await emprestimosService.getByCliente(clienteId);
      setEmprestimosRaw(Array.isArray(data) ? data : []);
    } catch {
      setEmprestimosRaw([]);
    } finally {
      setLoadingEmprestimos(false);
    }
  }, []);

  const fetchParcelasByEmprestimo = useCallback(async (emprestimoId: number) => {
    setLoadingParcelas(true);

    try {
      const results = await Promise.all(
        PARCELA_STATUSES.map((status) =>
          apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`)
        )
      );

      const merged = results.flat();

      const filtered = merged
        .filter((parcela) => parcela.idEmprestimo === emprestimoId)
        .sort((a, b) => {
          if (a.status === "PAGO" && b.status !== "PAGO") return 1;
          if (a.status !== "PAGO" && b.status === "PAGO") return -1;

          return safeDateMs(a.dataVencimento) - safeDateMs(b.dataVencimento);
        });

      setParcelas(filtered);
    } catch (error) {
      console.error("Erro ao buscar parcelas do empréstimo:", error);
      setParcelas([]);
    } finally {
      setLoadingParcelas(false);
    }
  }, []);

  const handleSelectCliente = useCallback(
    (id: number | null) => {
      setSelectedCliente(id);
      setSelectedEmprestimoId(null);
      setEmprestimosRaw([]);
      setParcelas([]);

      if (!id) {
        setLoadingEmprestimos(false);
        setLoadingParcelas(false);
        return;
      }

      fetchEmprestimos(id);
    },
    [fetchEmprestimos]
  );

  const selectCliente = useCallback(
    (cliente: Cliente) => {
      setClientSearch(cliente.nome ?? "");
      setClientSearchError(null);
      handleSelectCliente(cliente.id);
    },
    [handleSelectCliente]
  );

  const clientesFiltrados = useMemo(() => {
    const termo = safeLower(clientSearch);

    const lista = termo
      ? clientes.filter((c) => safeLower(c.nome).includes(termo))
      : clientes;

    return [...lista].sort((a, b) =>
      (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [clientes, clientSearch]);

  const suggestions = useMemo(() => {
    const termo = safeLower(clientSearch);
    if (!termo) return [];

    const termoNorm = normalize(termo);

    return clientes
      .filter((c) => normalize(c.nome).includes(termoNorm))
      .slice(0, 8);
  }, [clientes, clientSearch]);

  const emprestimos = useMemo<RelatorioEmprestimoOption[]>(() => {
  return [...emprestimosRaw]
    .sort((a, b) => safeDateMs(b.dataEmprestimo) - safeDateMs(a.dataEmprestimo))
    .map((item) => ({
      id: item.id,
      label: `${formatCurrency(item.valorEmprestado)} - ${item.status}`,
    }));
}, [emprestimosRaw]);

  const selectedClienteName = useMemo(() => {
    if (!selectedCliente) return null;
    return clientes.find((c) => c.id === selectedCliente)?.nome ?? null;
  }, [clientes, selectedCliente]);

  const selectedEmprestimoLabel = useMemo(() => {
    if (!selectedEmprestimoId) return null;
    return emprestimos.find((e) => e.id === selectedEmprestimoId)?.label ?? null;
  }, [emprestimos, selectedEmprestimoId]);

  const tryAutoSelect = useCallback(
    (value: string) => {
      const termo = safeLower(value);
      if (!termo) return;

      const termoNorm = normalize(termo);

      const exact = clientes.find((c) => normalize(c.nome) === termoNorm);
      if (exact && exact.id !== selectedCliente) {
        handleSelectCliente(exact.id);
        return;
      }

      if (termoNorm.length >= 4) {
        const matches = clientes.filter((c) =>
          normalize(c.nome).includes(termoNorm)
        );

        if (matches.length === 1 && matches[0].id !== selectedCliente) {
          handleSelectCliente(matches[0].id);
        }
      }
    },
    [clientes, handleSelectCliente, selectedCliente]
  );

  const handleClientSearchChange = useCallback(
    (value: string) => {
      const parsed = clienteSearchSchema.safeParse(value);

      if (!parsed.success) {
        setClientSearchError(
          parsed.error.issues[0]?.message ?? "Busca inválida."
        );
        return;
      }

      setClientSearchError(null);
      setClientSearch(parsed.data);

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        tryAutoSelect(parsed.data);
      }, 250);
    },
    [tryAutoSelect]
  );

  useEffect(() => {
    if (!selectedEmprestimoId) {
      setParcelas([]);
      return;
    }

    fetchParcelasByEmprestimo(selectedEmprestimoId);
  }, [selectedEmprestimoId, fetchParcelasByEmprestimo]);

  const clearFilters = useCallback(() => {
    setClientSearch("");
    setClientSearchError(null);
    setSelectedCliente(null);
    setSelectedEmprestimoId(null);
    setEmprestimosRaw([]);
    setParcelas([]);
    setLoadingEmprestimos(false);
    setLoadingParcelas(false);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    clientes,
    clientesFiltrados,
    suggestions,

    clientSearch,
    clientSearchError,
    handleClientSearchChange,

    selectedClienteId: selectedCliente,
    selectedClienteName,
    handleSelectCliente,
    selectCliente,

    emprestimos,
    selectedEmprestimoId,
    selectedEmprestimoLabel,
    setSelectedEmprestimoId,

    parcelas,

    loadingClientes,
    loadingEmprestimos,
    loadingParcelas,

    clearFilters,
  };
}