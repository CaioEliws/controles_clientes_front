import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { clientesService } from "@/services/clientes.service";
import { emprestimosService } from "@/services/emprestimos.service";
import { useProfile } from "@/contexts/ProfileContext";
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
  const { perfilAtivo } = useProfile();

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
  const consultaEmprestimos = useRef(0);
  const consultaParcelas = useRef(0);
  const [erroParcelas, setErroParcelas] = useState<string | null>(null);
  const invalidarParcelas = useCallback(() => { consultaParcelas.current++; }, []);

  const clearState = useCallback(() => {
    setClientes([]);
    setEmprestimosRaw([]);
    setParcelas([]);
    setSelectedCliente(null);
    setSelectedEmprestimoId(null);
    setLoadingClientes(false);
    setLoadingEmprestimos(false);
    setLoadingParcelas(false);
    setClientSearch("");
    setClientSearchError(null);
  }, []);

  useEffect(() => {
    let alive = true;

    if (!perfilAtivo) {
      clearState();
      return;
    }

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
  }, [perfilAtivo, clearState]);

  const fetchEmprestimos = useCallback(
    async (clienteId: number) => {
      const consulta = ++consultaEmprestimos.current;
      if (!perfilAtivo) {
        setEmprestimosRaw([]);
        setLoadingEmprestimos(false);
        return;
      }

      setLoadingEmprestimos(true);

      try {
        const data = await emprestimosService.getByCliente(clienteId);
        if (consulta !== consultaEmprestimos.current) return;
        setEmprestimosRaw(Array.isArray(data) ? data : []);
      } catch {
        if (consulta !== consultaEmprestimos.current) return;
        setEmprestimosRaw([]);
      } finally {
        if (consulta === consultaEmprestimos.current) setLoadingEmprestimos(false);
      }
    },
    [perfilAtivo]
  );

  const fetchParcelasByEmprestimo = useCallback(
    async (emprestimoId: number) => {
      const consulta = ++consultaParcelas.current;
      if (!perfilAtivo) {
        setParcelas([]);
        setLoadingParcelas(false);
        return;
      }

      setLoadingParcelas(true);
      setParcelas([]);
      setErroParcelas(null);

      try {
        const results = await Promise.all(
          PARCELA_STATUSES.map((status) =>
            apiClient.get<ParcelaResponse[]>(`/parcelas?status=${status}`)
          )
        );

        const merged = results.flat();
        if (consulta !== consultaParcelas.current) return;

        const filtered = merged
          .filter((parcela) => parcela.idEmprestimo === emprestimoId)
          .sort((a, b) => a.numeroParcela - b.numeroParcela);

        setParcelas(filtered);
      } catch (error) {
        if (consulta !== consultaParcelas.current) return;
        setErroParcelas("Não foi possível carregar as parcelas. Selecione o empréstimo novamente para tentar outra vez.");
        console.error("Erro ao buscar parcelas do empréstimo:", error);
        setParcelas([]);
      } finally {
        if (consulta === consultaParcelas.current) setLoadingParcelas(false);
      }
    },
    [perfilAtivo]
  );

  const handleSelectCliente = useCallback(
    (id: number | null) => {
      consultaEmprestimos.current++;
      consultaParcelas.current++;
      setErroParcelas(null);
      setSelectedCliente(id);
      setSelectedEmprestimoId(null);
      setEmprestimosRaw([]);
      setParcelas([]);

      if (!id || !perfilAtivo) {
        setLoadingEmprestimos(false);
        setLoadingParcelas(false);
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
    if (!selectedEmprestimoId || !perfilAtivo) {
      setParcelas([]);
      return;
    }

    void fetchParcelasByEmprestimo(selectedEmprestimoId);
    return invalidarParcelas;
  }, [selectedEmprestimoId, fetchParcelasByEmprestimo, perfilAtivo, invalidarParcelas]);

  const clearFilters = useCallback(() => {
    consultaEmprestimos.current++;
    consultaParcelas.current++;
    setErroParcelas(null);
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
    selectedEmprestimo: emprestimosRaw.find((e) => e.id === selectedEmprestimoId) ?? null,
    erroParcelas,
    setSelectedEmprestimoId,

    parcelas: parcelas.filter((p) => p.idEmprestimo === selectedEmprestimoId),

    loadingClientes,
    loadingEmprestimos,
    loadingParcelas,

    clearFilters,
  };
}
