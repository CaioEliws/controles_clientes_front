import { useMemo } from "react";
import type { ParcelaResponse, StatusParcela } from "@/types";
import { safeDate } from "@/utils/normalize";

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

interface UseParcelasFiltradasParams {
  parcelas: ParcelaResponse[];
  search?: string;
  selectedClients?: string[];
  selectedStatuses?: StatusParcela[];
  selectedMonth?: number | "ALL";
  sortOrder?: "asc" | "desc";
}

export function useParcelasFiltradas({
  parcelas,
  search = "",
  selectedClients = [],
  selectedStatuses = [],
  selectedMonth = "ALL",
  sortOrder = "asc",
}: UseParcelasFiltradasParams) {

  const filtradas = useMemo(() => {
    let result = [...parcelas];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => p.nomeCliente?.toLowerCase().includes(s));
    }

    if (selectedClients.length) {
      result = result.filter(
        p => !!p.nomeCliente && selectedClients.includes(p.nomeCliente)
      );
    }

    if (selectedStatuses.length) {
      result = result.filter(p => selectedStatuses.includes(p.status));
    }

    if (selectedMonth !== "ALL") {
      result = result.filter((p) => {
        const d = safeDate(p.dataVencimento);
        if (!d) return false;
        return d.getMonth() === selectedMonth;
      });
    }

    result.sort((a, b) => {
      if (a.status === "PAGO" && b.status !== "PAGO") return 1;
      if (a.status !== "PAGO" && b.status === "PAGO") return -1;

      const dateA = safeDate(a.dataVencimento)?.getTime() ?? 0;
      const dateB = safeDate(b.dataVencimento)?.getTime() ?? 0;

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [
    parcelas,
    search,
    selectedClients,
    selectedStatuses,
    selectedMonth,
    sortOrder,
  ]);

  const totalAtrasadas = useMemo(
    () => filtradas.filter(p => p.status === "ATRASADO").length,
    [filtradas]
  );

  const vencendoEstaSemana = useMemo(() => {
    const hoje = new Date();
    const semanaFutura = new Date();
    semanaFutura.setDate(hoje.getDate() + 7);

    return filtradas.filter(p => {
      const venc = safeDate(p.dataVencimento);
      if (!venc) return false;
      return venc >= hoje && venc <= semanaFutura;
    }).length;
  }, [filtradas]);

  return {
    filtradas,
    totalAtrasadas,
    vencendoEstaSemana,
  };
}