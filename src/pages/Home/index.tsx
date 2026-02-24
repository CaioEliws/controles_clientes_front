import { useState } from "react"; // 1. Importe o useState
import { useDashboard } from "@/hooks/useDashboard";

import { DashboardHeader } from "./components/DashboardHeader";
import { StatsCards } from "./components/StatsCards";
import { FinancialChart } from "./components/FinancialChart";
import { VencemHojeTable } from "./components/VencemHojeTable";
import { AtrasadasTable } from "./components/AtrasadasTable";

export function Home() {
  const {
    period,
    setPeriod,
    vencemHoje,
    atrasadas,
    stats,
    chartData,
    handlePagar,
  } = useDashboard();

  // 2. Crie o estado da página aqui no Pai
  const [pageAtrasadas, setPageAtrasadas] = useState(1);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <main className="flex-1 p-10 space-y-10">
        <DashboardHeader
          period={period}
          setPeriod={setPeriod}
        />

        <StatsCards {...stats} />

        <FinancialChart data={chartData} />

        <div className="grid gap-10">
          <VencemHojeTable
            parcelas={vencemHoje}
            onPagar={handlePagar}
          />

          <AtrasadasTable 
            parcelas={atrasadas} 
            page={pageAtrasadas}
            onNext={() => setPageAtrasadas(prev => prev + 1)}
            onPrev={() => setPageAtrasadas(prev => prev - 1)}
          />
        </div>
      </main>
    </div>
  );
}