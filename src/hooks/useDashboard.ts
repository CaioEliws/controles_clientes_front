import { useCallback, useMemo, useState } from "react";
import { parcelasService } from "@/services/parcelas.service";
import type { ParcelaResponse } from "@/types";
import {
  mapParcelaToTable,
  type ParcelaTable,
} from "@/mappers/parcela.mapper";

export function useDashboard() {
  const [period, setPeriod] =
    useState<"3" | "6" | "12" | "all">("6");

  const [vencemHoje, setVencemHoje] =
    useState<ParcelaTable[]>([]);
  const [atrasadas, setAtrasadas] =
    useState<ParcelaTable[]>([]);
  const [mesAtual, setMesAtual] =
    useState<ParcelaResponse[]>([]);

  const [stats, setStats] = useState({
    totalEmprestado: 0,
    totalRecebido: 0,
    totalAberto: 0,
    totalAtraso: 0,
  });

  const loadData = useCallback(async () => {
    const [
      vencendo,
      atrasado,
      pagas,
      pendentes,
      mes,
    ] = await Promise.all([
      parcelasService.getVencendoHoje(),
      parcelasService.getPorStatus("ATRASADO"),
      parcelasService.getPorStatus("PAGO"),
      parcelasService.getPorStatus("PENDENTE"),
      parcelasService.getMesAtual(),
    ]);

    setVencemHoje(vencendo.map(mapParcelaToTable));
    setAtrasadas(atrasado.map(mapParcelaToTable));
    setMesAtual(mes);

    const totalRecebido = pagas.reduce(
      (acc, p) => acc + (p.valorPago ?? 0),
      0
    );

    const totalAberto = pendentes.reduce(
      (acc, p) => acc + p.valorParcela,
      0
    );

    const totalAtraso = atrasado.reduce(
      (acc, p) => acc + p.valorParcela,
      0
    );

    setStats({
      totalEmprestado: totalRecebido + totalAberto,
      totalRecebido,
      totalAberto,
      totalAtraso,
    });
  }, []);

  // 👇 chama apenas uma vez fora do effect
  if (vencemHoje.length === 0 && atrasadas.length === 0) {
    void loadData();
  }

  const handlePagar = useCallback(
    async (idEmprestimo: number, numeroParcela: number) => {
      await parcelasService.pagar(
        idEmprestimo,
        numeroParcela
      );
      await loadData();
    },
    [loadData]
  );

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    mesAtual.forEach((parcela) => {
      const mes = new Date(
        parcela.dataVencimento
      ).toLocaleString("pt-BR", {
        month: "short",
      });

      grouped[mes] =
        (grouped[mes] ?? 0) +
        parcela.valorParcela;
    });

    const formatted = Object.entries(grouped).map(
      ([mes, recebido]) => ({
        mes,
        recebido,
      })
    );

    return period === "all"
      ? formatted
      : formatted.slice(-Number(period));
  }, [mesAtual, period]);

  return {
    period,
    setPeriod,
    vencemHoje,
    atrasadas,
    stats,
    chartData,
    handlePagar,
  };
}