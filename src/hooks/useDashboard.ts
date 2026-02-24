import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { parcelasService } from "@/services/parcelas.service";
import type { ParcelaResponse } from "@/types";
import {
  mapParcelaToTable,
  type ParcelaTable,
} from "@/mappers/parcela.mapper";

type Period = "3" | "6" | "12" | "all";

interface Stats {
  totalEmprestado: number;
  totalRecebido: number;
  totalAberto: number;
  totalAtraso: number;
}

const filterByPeriod = (
  parcelas: ParcelaResponse[],
  period: Period
) => {
  if (period === "all") return parcelas;

  const now = new Date();
  const limite = new Date(
    now.getFullYear(),
    now.getMonth() - Number(period),
    now.getDate()
  ).getTime();

  return parcelas.filter((p) => {
    const data = new Date(p.dataVencimento).getTime();
    return data >= limite;
  });
};

export function useDashboard() {
  const location = useLocation();

  const [period, setPeriod] = useState<Period>("6");
  const [vencemHoje, setVencemHoje] = useState<ParcelaTable[]>([]);
  const [atrasadas, setAtrasadas] = useState<ParcelaTable[]>([]);
  const [todasParcelas, setTodasParcelas] = useState<ParcelaResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBaseData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        vencendo,
        atrasado,
        pagas,
        pendentes,
      ] = await Promise.all([
        parcelasService.getVencendoHoje(),
        parcelasService.getPorStatus("ATRASADO"),
        parcelasService.getPorStatus("PAGO"),
        parcelasService.getPorStatus("PENDENTE"),
      ]);

      setVencemHoje(vencendo.map(mapParcelaToTable));
      setAtrasadas(atrasado.map(mapParcelaToTable));
      setTodasParcelas([
        ...pagas,
        ...pendentes,
        ...atrasado,
      ]);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setVencemHoje([]);
      setAtrasadas([]);
      setTodasParcelas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 Recarrega sempre que entrar na rota
  useEffect(() => {
    void loadBaseData();
  }, [location.key, loadBaseData]);

  const stats = useMemo<Stats>(() => {
    const parcelasFiltradas = filterByPeriod(
      todasParcelas,
      period
    );

    const totalRecebido = parcelasFiltradas
      .filter((p) => (p.valorPago ?? 0) > 0)
      .reduce((acc, p) => acc + (p.valorPago ?? 0), 0);

    const totalAberto = parcelasFiltradas
      .filter((p) => p.status === "PENDENTE")
      .reduce((acc, p) => acc + p.valorParcela, 0);

    const totalAtraso = parcelasFiltradas
      .filter((p) => p.status === "ATRASADO")
      .reduce((acc, p) => acc + p.valorParcela, 0);

    // 🔥 Agora calculamos no frontend
    const totalEmprestado = parcelasFiltradas.reduce(
      (acc, p) => acc + p.valorParcela,
      0
    );

    return {
      totalEmprestado,
      totalRecebido,
      totalAberto,
      totalAtraso,
    };
  }, [todasParcelas, period]);

  const chartData = useMemo(() => {
    const parcelasFiltradas = filterByPeriod(
      todasParcelas,
      period
    );

    const grouped: Record<string, number> = {};

    parcelasFiltradas.forEach((parcela) => {
      const mes = new Date(
        parcela.dataVencimento
      ).toLocaleString("pt-BR", {
        month: "short",
      });

      grouped[mes] =
        (grouped[mes] ?? 0) +
        parcela.valorParcela;
    });

    return Object.entries(grouped).map(
      ([mes, recebido]) => ({
        mes,
        recebido,
      })
    );
  }, [todasParcelas, period]);

  const handlePagar = useCallback(
    async (idEmprestimo: number, numeroParcela: number) => {
      try {
        await parcelasService.pagar(
          idEmprestimo,
          numeroParcela
        );
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
  };
}