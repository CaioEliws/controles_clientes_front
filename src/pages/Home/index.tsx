import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";

import { DashboardHeader } from "@/pages//Home/components/DashboardHeader";
import { StatsCards } from "@/pages//Home/components/StatsCards";
import { FinancialChart } from "@/pages//Home/components/FinancialChart";
import { VencemHojeTable } from "@/pages//Home/components/VencemHojeTable";
import { AtrasadasTable } from "@/pages//Home/components/AtrasadasTable";

export function Home() {
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

  return (
    <div className="flex min-h-screen bg-muted/40">
      <main className="flex-1 p-10 space-y-10">
        <DashboardHeader period={period} setPeriod={setPeriod} />

        <StatsCards loading={loading} {...stats} />

        <FinancialChart loading={loading} data={chartData} />

        <div className="grid gap-10">
          <VencemHojeTable
            loading={loading}
            parcelas={vencemHoje}
            onRefresh={refresh}
          />

          <AtrasadasTable
            loading={loading}
            parcelas={atrasadas}
            page={pageAtrasadas}
            onNext={() => setPageAtrasadas((prev) => prev + 1)}
            onPrev={() => setPageAtrasadas((prev) => Math.max(1, prev - 1))}
          />
        </div>
      </main>
    </div>
  );
}