import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { parcelasService } from "@/services/parcelas.service";
import type { ParcelaResponse } from "@/types";
import { mapParcelaToTable, type ParcelaTable } from "@/mappers/parcela.mapper";
import { parseDateISOorBR } from "@/utils/date";
import { safeDate, toIsoDateString, toNumber } from "@/utils/normalize";

type Period = "3" | "6" | "12" | "all";

interface Stats {
  totalEmprestado: number;
  totalRecebido: number;
  totalAberto: number;
  totalAtraso: number;
}

const filterByPeriod = (parcelas: ParcelaResponse[], period: Period) => {
  if (period === "all") return parcelas;

  const now = new Date();
  const limite = new Date(
    now.getFullYear(),
    now.getMonth() - Number(period),
    now.getDate()
  ).getTime();

  return parcelas.filter((p) => {
    // parseDateISOorBR espera string, então normalizamos antes
    const dt = parseDateISOorBR(toIsoDateString(p.dataVencimento));
    if (!dt) return false;
    return dt.getTime() >= limite;
  });
};

const DASHBOARD_CACHE_TTL_MS = 60_000;

let dashboardCache:
  | {
      ts: number;
      vencemHoje: ParcelaTable[];
      atrasadas: ParcelaTable[];
      todasParcelas: ParcelaResponse[];
    }
  | null = null;

export function useDashboard() {
  const [period, setPeriod] = useState<Period>("all");

  const [vencemHoje, setVencemHoje] = useState<ParcelaTable[]>(
    () => dashboardCache?.vencemHoje ?? []
  );
  const [atrasadas, setAtrasadas] = useState<ParcelaTable[]>(
    () => dashboardCache?.atrasadas ?? []
  );
  const [todasParcelas, setTodasParcelas] = useState<ParcelaResponse[]>(
    () => dashboardCache?.todasParcelas ?? []
  );

  const [loading, setLoading] = useState(false);

  const loadBaseData = useCallback(async () => {
    setLoading(true);

    try {
      const [vencendo, atrasado, pagas, pendentes] = await Promise.all([
        parcelasService.getVencendoHoje(),
        parcelasService.getPorStatus("ATRASADO"),
        parcelasService.getPorStatus("PAGO"),
        parcelasService.getPorStatus("PENDENTE"),
      ]);

      const vencemHojeMapped = vencendo.map(mapParcelaToTable);
      const atrasadasMapped = atrasado.map(mapParcelaToTable);

      // base do dashboard (todas as parcelas)
      const todas = [...pagas, ...pendentes, ...atrasado];

      setVencemHoje(vencemHojeMapped);
      setAtrasadas(atrasadasMapped);
      setTodasParcelas(todas);

      dashboardCache = {
        ts: Date.now(),
        vencemHoje: vencemHojeMapped,
        atrasadas: atrasadasMapped,
        todasParcelas: todas,
      };
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const cacheValido =
      dashboardCache && now - dashboardCache.ts < DASHBOARD_CACHE_TTL_MS;

    if (!cacheValido) {
      void loadBaseData();
    }
  }, [loadBaseData]);

  const refresh = useCallback(async () => {
    await loadBaseData();
  }, [loadBaseData]);

  const stats = useMemo<Stats>(() => {
    const parcelasFiltradas = filterByPeriod(todasParcelas, period);

    const totalRecebido = parcelasFiltradas
      .filter((p) => toNumber(p.valorPago) > 0)
      .reduce((acc, p) => acc + toNumber(p.valorPago), 0);

    const totalAberto = parcelasFiltradas
      .filter((p) => p.status === "PENDENTE")
      .reduce((acc, p) => acc + toNumber(p.valorParcela), 0);

    const totalAtraso = parcelasFiltradas
      .filter((p) => p.status === "ATRASADO")
      .reduce((acc, p) => acc + toNumber(p.valorParcela), 0);

    const totalEmprestado = parcelasFiltradas.reduce(
      (acc, p) => acc + toNumber(p.valorParcela),
      0
    );

    return { totalEmprestado, totalRecebido, totalAberto, totalAtraso };
  }, [todasParcelas, period]);

  const chartData = useMemo(() => {
    const parcelasFiltradas = filterByPeriod(todasParcelas, period);

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

  const handlePagar = useCallback(
    async (
      idEmprestimo: number,
      numeroParcela: number,
      valorParcela: number,
      valorPago?: number
    ) => {
      try {
        const pagamentoTotal =
          !valorPago || Math.abs(valorPago - valorParcela) < 0.01;

        if (pagamentoTotal) {
          await apiClient.post("/parcelas/pagar", { idEmprestimo, numeroParcela });
        } else {
          await apiClient.post("/parcelas/pagar-parcial", {
            idEmprestimo,
            numeroParcela,
            valorPago,
          });
        }

        await loadBaseData();
      } catch (error) {
        console.error("Erro ao pagar parcela:", error);
      }
    },
    [loadBaseData]
  );

  return {
    period,
    setPeriod,
    vencemHoje,
    atrasadas,
    stats,
    chartData,
    loading,
    handlePagar,
    refresh,
  };
}