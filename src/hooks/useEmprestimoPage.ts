import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emprestimosService } from "@/services/emprestimos.service";
import { clientesService } from "@/services/clientes.service";
import type { Cliente, EmprestimoDetalhado } from "@/types";

import { z } from "zod";

const safeSearchRegex = /^[\p{L}\p{N}\s.'()-]*$/u;

const clienteSearchSchema = z
  .string()
  .max(60, "Pesquisa muito longa (máx 60 caracteres).")
  .refine((s) => safeSearchRegex.test(s), "Use apenas letras/números e (.,'()-).");

export function useEmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoDetalhado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    clientesService.getAll().then((data) => {
      if (!alive) return;
      setClientes(data);
    });

    return () => {
      alive = false;
    };
  }, []);

  const fetchEmprestimos = useCallback(async (clienteId: number) => {
    setLoading(true);
    try {
      const data = await emprestimosService.getByCliente(clienteId);
      setEmprestimos(data);
    } catch {
      setEmprestimos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCliente = useCallback(
    (id: number | null) => {
      setSelectedCliente(id);
      setEmprestimos([]);

      if (!id) {
        setLoading(false);
        return;
      }

      fetchEmprestimos(id);
    },
    [fetchEmprestimos]
  );

  const selectCliente = useCallback(
    (cliente: Cliente) => {
      setClientSearch(cliente.nome);
      setClientSearchError(null);
      handleSelectCliente(cliente.id);
    },
    [handleSelectCliente]
  );

  const clientesFiltrados = useMemo(() => {
    const termo = clientSearch.trim().toLowerCase();

    const lista = termo
      ? clientes.filter((c) =>
          c.nome.toLowerCase().includes(termo)
        )
      : clientes;

    return [...lista].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [clientes, clientSearch]);

  const suggestions = useMemo(() => {
  const termo = clientSearch.trim().toLowerCase();
  if (!termo) return [];

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ");

  const termoNorm = normalize(termo);

  return clientes
    .filter((c) => normalize(c.nome).includes(termoNorm))
    .slice(0, 8);
}, [clientes, clientSearch]);


  const emprestimosView = useMemo(() => {
    const sorted = [...emprestimos].sort((a, b) => {
      const da = new Date(a.dataEmprestimo).getTime();
      const db = new Date(b.dataEmprestimo).getTime();
      return sortOrder === "asc" ? db - da : da - db;
    });

    return sorted;
  }, [emprestimos, sortOrder]);

  const emprestimosFiltrados = useMemo(() => {
    const termo = clientSearch.trim().toLowerCase();
    if (!termo) return emprestimosView;

    return emprestimosView.filter((e) =>
      (e.nomeCliente ?? "").toLowerCase().includes(termo)
    );
  }, [emprestimosView, clientSearch]);

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
    if (selectedCliente) fetchEmprestimos(selectedCliente);
  }, [fetchEmprestimos, selectedCliente]);

  const tryAutoSelect = useCallback(
    (value: string) => {
      const termo = value.trim().toLowerCase();
      if (!termo) return;

      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
      const termoNorm = normalize(termo);

      const exact = clientes.find((c) => normalize(c.nome) === termoNorm);
      if (exact && exact.id !== selectedCliente) {
        handleSelectCliente(exact.id);
        return;
      }

      if (termoNorm.length >= 4) {
        const matches = clientes.filter((c) => normalize(c.nome).includes(termoNorm));
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
        setClientSearchError(parsed.error.issues[0]?.message ?? "Busca inválida.");
        return;
      }

      setClientSearchError(null);
      setClientSearch(parsed.data);

      if (debounceRef.current) window.clearTimeout(debounceRef.current);
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

    setEmprestimos([]);

    setLoading(false);
  }, []);

  return {
    clientes, 
    clientesFiltrados,

    emprestimos: emprestimosFiltrados,
    loading,

    sortOrder,
    setSortOrder,

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