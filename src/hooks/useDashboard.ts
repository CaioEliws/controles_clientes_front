import { useCallback, useEffect, useMemo, useState } from "react";
import { parcelasService } from "@/services/parcelas/parcelas.service";
import { emprestimosService } from "@/services/emprestimos.service";
import type { ParcelaResponse, EmprestimoDetalhado, Cliente } from "@/types";
import { mapParcelaToTable, type ParcelaTable } from "@/mappers/parcela.mapper";
import { parseDateISOorBR } from "@/utils/date";
import { safeDate, toIsoDateString, toNumber } from "@/utils/normalize";
import { clientesService } from "@/services/clientes.service";
import { useProfile } from "@/contexts/ProfileContext";

type Period = "3" | "6" | "12" | "all";

interface Stats {
  totalEmprestado: number;
  totalRecebido: number;
  totalAberto: number;
  totalAtraso: number;
}

const filterParcelasByPeriod = (parcelas: ParcelaResponse[], period: Period) => {
  if (period === "all") return parcelas;

  const now = new Date();
  const limite = new Date(
    now.getFullYear(),
    now.getMonth() - Number(period),
    now.getDate()
  ).getTime();

  return parcelas.filter((p) => {
    const dt = parseDateISOorBR(toIsoDateString(p.dataVencimento));
    if (!dt) return false;
    return dt.getTime() >= limite;
  });
};

const filterEmprestimosByPeriod = (
  emprestimos: EmprestimoDetalhado[],
  period: Period
) => {
  if (period === "all") return emprestimos;

  const now = new Date();
  const limite = new Date(
    now.getFullYear(),
    now.getMonth() - Number(period),
    now.getDate()
  ).getTime();

  return emprestimos.filter((e) => {
    const dt = safeDate(e.dataEmprestimo);
    if (!dt) return false;
    return dt.getTime() >= limite;
  });
};

const DASHBOARD_CACHE_TTL_MS = 60_000;

let dashboardCache:
  | {
      ts: number;
      perfilId: number;
      vencemHoje: ParcelaTable[];
      atrasadas: ParcelaTable[];
      todasParcelas: ParcelaResponse[];
      todosEmprestimos: EmprestimoDetalhado[];
    }
  | null = null;

function getDashboardCacheForProfile(perfilId?: number | null) {
  const cache = dashboardCache;
  if (!cache || !perfilId || cache.perfilId !== perfilId) {
    return null;
  }
  return cache;
}

export function useDashboard() {
  const { perfilAtivo } = useProfile();

  const [period, setPeriod] = useState<Period>("all");

  const [vencemHoje, setVencemHoje] = useState<ParcelaTable[]>(() => {
    return getDashboardCacheForProfile(perfilAtivo?.id)?.vencemHoje ?? [];
  });

  const [atrasadas, setAtrasadas] = useState<ParcelaTable[]>(() => {
    return getDashboardCacheForProfile(perfilAtivo?.id)?.atrasadas ?? [];
  });

  const [todasParcelas, setTodasParcelas] = useState<ParcelaResponse[]>(() => {
    return getDashboardCacheForProfile(perfilAtivo?.id)?.todasParcelas ?? [];
  });

  const [todosEmprestimos, setTodosEmprestimos] = useState<EmprestimoDetalhado[]>(() => {
    return getDashboardCacheForProfile(perfilAtivo?.id)?.todosEmprestimos ?? [];
  });

  const [loading, setLoading] = useState(false);

  const clearState = useCallback(() => {
    setVencemHoje([]);
    setAtrasadas([]);
    setTodasParcelas([]);
    setTodosEmprestimos([]);
    setLoading(false);
  }, []);

  const loadBaseData = useCallback(async () => {
    if (!perfilAtivo) {
      clearState();
      return;
    }

    setLoading(true);

    try {
      const [clientes, vencendo, atrasado, pagas, pendentes, parciais] =
        await Promise.all([
          clientesService.getAll(),
          parcelasService.getVencendoHoje(),
          parcelasService.getPorStatus("ATRASADO"),
          parcelasService.getPorStatus("PAGO"),
          parcelasService.getPorStatus("PENDENTE"),
          parcelasService.getPorStatus("PARCIAL"),
        ]);

      const emprestimosPorCliente = await Promise.all(
        clientes.map((cliente: Cliente) =>
          emprestimosService
            .getByCliente(cliente.id)
            .catch(() => [] as EmprestimoDetalhado[])
        )
      );

      const todosEmprestimosFlat = emprestimosPorCliente.flat();

      const vencemHojeMapped = vencendo.map(mapParcelaToTable);
      const atrasadasMapped = atrasado.map(mapParcelaToTable);

      const todas = [...pagas, ...pendentes, ...atrasado, ...parciais];

      setVencemHoje(vencemHojeMapped);
      setAtrasadas(atrasadasMapped);
      setTodasParcelas(todas);
      setTodosEmprestimos(todosEmprestimosFlat);

      dashboardCache = {
        ts: Date.now(),
        perfilId: perfilAtivo.id,
        vencemHoje: vencemHojeMapped,
        atrasadas: atrasadasMapped,
        todasParcelas: todas,
        todosEmprestimos: todosEmprestimosFlat,
      };
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      clearState();
    } finally {
      setLoading(false);
    }
  }, [perfilAtivo, clearState]);

  useEffect(() => {
    if (!perfilAtivo) {
      clearState();
      return;
    }

    const now = Date.now();
    const cache = dashboardCache;

    const cacheValido =
      cache &&
      cache.perfilId === perfilAtivo.id &&
      now - cache.ts < DASHBOARD_CACHE_TTL_MS;

    if (cacheValido) {
      setVencemHoje(cache.vencemHoje);
      setAtrasadas(cache.atrasadas);
      setTodasParcelas(cache.todasParcelas);
      setTodosEmprestimos(cache.todosEmprestimos);
      setLoading(false);
      return;
    }

    void loadBaseData();
  }, [perfilAtivo, loadBaseData, clearState]);

  const refresh = useCallback(async () => {
    dashboardCache = null;
    await loadBaseData();
  }, [loadBaseData]);

  const stats = useMemo<Stats>(() => {
    const emprestimosFiltrados = filterEmprestimosByPeriod(todosEmprestimos, period);
    const parcelasFiltradas = filterParcelasByPeriod(todasParcelas, period);

    const totalEmprestado = emprestimosFiltrados.reduce(
      (acc, e) => acc + toNumber(e.valorTotalEmprestimo),
      0
    );

    const totalRecebido = emprestimosFiltrados.reduce(
      (acc, e) => acc + toNumber(e.valorRecebido),
      0
    );

    const totalAberto = emprestimosFiltrados.reduce(
      (acc, e) => acc + toNumber(e.valorAReceber),
      0
    );

    const totalAtraso = parcelasFiltradas
      .filter((p) => p.status === "ATRASADO")
      .reduce((acc, p) => acc + toNumber(p.valorParcela), 0);

    return {
      totalEmprestado,
      totalRecebido,
      totalAberto,
      totalAtraso,
    };
  }, [todosEmprestimos, todasParcelas, period]);

  const chartData = useMemo(() => {
    const parcelasFiltradas = filterParcelasByPeriod(todasParcelas, period);

    const grouped = new Map<string, number>();

    for (const p of parcelasFiltradas) {
      const d = safeDate(p.dataVencimento);
      if (!d) continue;

      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;

      grouped.set(key, (grouped.get(key) ?? 0) + toNumber(p.valorParcela));
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, recebido]) => {
        const [yy, mm] = key.split("-");
        const date = new Date(Number(yy), Number(mm) - 1, 1);

        const mesShort = date
          .toLocaleString("pt-BR", { month: "short" })
          .replace(".", "");

        const year = date.getFullYear();
        const yearShort = String(year).slice(-2);

        return {
          key,
          year,
          label: `${mesShort}/${yearShort}`,
          recebido,
        };
      });
  }, [todasParcelas, period]);

  return {
    period,
    setPeriod,
    vencemHoje,
    atrasadas,
    stats,
    chartData,
    loading,
    refresh,
  };
}