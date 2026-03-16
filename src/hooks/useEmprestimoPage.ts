import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emprestimosService } from "@/services/emprestimos.service";
import { clientesService } from "@/services/clientes.service";
import type { Cliente, EmprestimoDetalhado } from "@/types";
import { z } from "zod";
import { useProfile } from "@/contexts/ProfileContext";

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

const safeDateMs = (s: string): number => {
  const ms = new Date(s).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

type StatusFilter = "ALL" | "EM_ABERTO" | "REFINANCIADO" | "QUITADO";

const statusPriority: Record<string, number> = {
  EM_ABERTO: 0,
  REFINANCIADO: 1,
  QUITADO: 2,
};

export function useEmprestimosPage() {
  const { perfilAtivo } = useProfile();

  const [emprestimos, setEmprestimos] = useState<EmprestimoDetalhado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("ALL");

  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const clearState = useCallback(() => {
    setEmprestimos([]);
    setClientes([]);
    setSelectedCliente(null);
    setLoading(false);
    setClientSearch("");
    setClientSearchError(null);
    setSelectedStatus("ALL");
    setSortOrder("desc");
  }, []);

  useEffect(() => {
    let alive = true;

    if (!perfilAtivo) {
      clearState();
      return;
    }

    clientesService
      .getAll()
      .then((data) => {
        if (!alive) return;
        setClientes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!alive) return;
        setClientes([]);
      });

    return () => {
      alive = false;

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [perfilAtivo, clearState]);

  const fetchEmprestimos = useCallback(
    async (clienteId: number) => {
      if (!perfilAtivo) {
        setEmprestimos([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await emprestimosService.getByCliente(clienteId);
        setEmprestimos(Array.isArray(data) ? data : []);
      } catch {
        setEmprestimos([]);
      } finally {
        setLoading(false);
      }
    },
    [perfilAtivo]
  );

  const handleSelectCliente = useCallback(
    (id: number | null) => {
      setSelectedCliente(id);
      setEmprestimos([]);

      if (!id || !perfilAtivo) {
        setLoading(false);
        return;
      }

      void fetchEmprestimos(id);
    },
    [fetchEmprestimos, perfilAtivo]
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

  const emprestimosOrdenados = useMemo(() => {
    return [...emprestimos].sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 999;
      const priorityB = statusPriority[b.status] ?? 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const da = safeDateMs(a.dataEmprestimo);
      const db = safeDateMs(b.dataEmprestimo);

      return sortOrder === "asc" ? da - db : db - da;
    });
  }, [emprestimos, sortOrder]);

  const emprestimosFiltrados = useMemo(() => {
    let lista = emprestimosOrdenados;

    const termo = safeLower(clientSearch);
    if (termo) {
      lista = lista.filter((e) => safeLower(e.nomeCliente).includes(termo));
    }

    if (selectedStatus !== "ALL") {
      lista = lista.filter((e) => e.status === selectedStatus);
    }

    return lista;
  }, [emprestimosOrdenados, clientSearch, selectedStatus]);

  const selectedClienteName = useMemo(() => {
    if (!selectedCliente) return null;
    return clientes.find((c) => c.id === selectedCliente)?.nome ?? null;
  }, [clientes, selectedCliente]);

  const openParcelas = useCallback(
    ({ emprestimoId, cliente }: { emprestimoId: number; cliente: string }) => {
      const params = new URLSearchParams();
      params.set("cliente", cliente);
      params.set("emprestimoId", String(emprestimoId));
      navigate(`/parcelas?${params.toString()}`);
    },
    [navigate]
  );

  const refetch = useCallback(() => {
    if (selectedCliente && perfilAtivo) {
      void fetchEmprestimos(selectedCliente);
    }
  }, [fetchEmprestimos, selectedCliente, perfilAtivo]);

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

  const clearSearch = useCallback(() => {
    setClientSearch("");
    setClientSearchError(null);
    setSelectedCliente(null);
    setSelectedStatus("ALL");
    setSortOrder("desc");
    setEmprestimos([]);
    setLoading(false);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    clientes,
    clientesFiltrados,

    emprestimos: emprestimosFiltrados,
    loading,

    sortOrder,
    setSortOrder,

    selectedStatus,
    setSelectedStatus,

    selectedCliente,
    selectedClienteName,
    handleSelectCliente,

    suggestions,
    selectCliente,

    openParcelas,
    refetch,

    clientSearch,
    clientSearchError,
    handleClientSearchChange,
    clearSearch,
  };
}