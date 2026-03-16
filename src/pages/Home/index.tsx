import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useProfile } from "@/contexts/ProfileContext";

import { DashboardHeader } from "@/pages/Home/components/DashboardHeader";
import { StatsCards } from "@/pages/Home/components/StatsCards";
import { FinancialChart } from "@/pages/Home/components/FinancialChart";
import { VencemHojeTable } from "@/pages/Home/components/VencemHojeTable";
import { AtrasadasTable } from "@/pages/Home/components/AtrasadasTable";

export function Home() {
  const { perfilAtivo } = useProfile();

  const {
    period,
    setPeriod,
    vencemHoje,
    atrasadas,
    stats,
    chartData,
    loading,
    refresh,
  } = useDashboard();

  const [pageAtrasadas, setPageAtrasadas] = useState(1);

  if (!perfilAtivo) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Selecione um perfil em Configurações para visualizar os dados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 bg-muted/40 p-10">
      <DashboardHeader period={period} setPeriod={setPeriod} />

      <div className="min-w-0">
        <StatsCards loading={loading} {...stats} />
      </div>

      <div className="min-w-0">
        <FinancialChart loading={loading} data={chartData} />
      </div>

      <div className="grid min-w-0 gap-10">
        <VencemHojeTable
          loading={loading}
          parcelas={vencemHoje}
          onRefresh={refresh}
        />

        <AtrasadasTable
          loading={loading}
          parcelas={atrasadas}
          page={pageAtrasadas}
          onRefresh={refresh}
          onNext={() => setPageAtrasadas((prev) => prev + 1)}
          onPrev={() => setPageAtrasadas((prev) => Math.max(1, prev - 1))}
        />
      </div>
    </div>
  );
}