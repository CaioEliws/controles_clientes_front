import { useState, useMemo } from "react";

import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/pages/Home/components/StatsCards";
import { VencemHojeTable } from "@/pages/Home/components/VencemHojeTable";
import { AtrasadasTable } from "@/pages/Home/components/AtrasadasTable";

import { RxDashboard } from "react-icons/rx";
import { FiUsers, FiAward, FiDollarSign } from "react-icons/fi";

import { FinancialChart } from "./components/FinancialChart";
import { DashboardHeader } from "./components/DashboardHeader";

type StatusParcela = "PENDENTE" | "ATRASADO" | "PAGO";

interface Parcela {
  id: string;
  cliente_nome: string;
  valor: number;
  status: StatusParcela;
}

export function Home() {
  const [period, setPeriod] = useState<"3" | "6" | "12" | "all">("6");

  const menuItems = [
    { label: "Dashboard", path: "/", icon: <RxDashboard /> },
    { label: "Clientes", path: "/clientes", icon: <FiUsers /> },
    { label: "Assinaturas", path: "/assinaturas", icon: <FiAward /> },
    { label: "Financeiro", path: "/financeiro", icon: <FiDollarSign /> },
  ];

  const stats = {
    totalEmprestado: 150000,
    totalRecebido: 95000,
    totalAberto: 40000,
    totalAtraso: 15000,
  };

  const vencemHoje: Parcela[] = [
    {
      id: "1",
      cliente_nome: "João Silva",
      valor: 1500,
      status: "PENDENTE",
    },
    {
      id: "2",
      cliente_nome: "Maria Souza",
      valor: 2200,
      status: "ATRASADO",
    },
  ];

  const handlePagar = (id: string) => {
    console.log("Pagando parcela:", id);
  };

  const atrasadas = [
    { cliente: "Carlos Lima", diasAtraso: 5, valor: 1200 },
    { cliente: "Ana Costa", diasAtraso: 12, valor: 3400 },
  ];

  const chartData = useMemo(() => {
  const baseData = [
    { mes: "Jan", recebido: 12000 },
    { mes: "Fev", recebido: 18000 },
    { mes: "Mar", recebido: 15000 },
    { mes: "Abr", recebido: 22000 },
    { mes: "Mai", recebido: 17000 },
    { mes: "Jun", recebido: 25000 },
    { mes: "Jul", recebido: 21000 },
    { mes: "Ago", recebido: 19000 },
    { mes: "Set", recebido: 23000 },
    { mes: "Out", recebido: 26000 },
    { mes: "Nov", recebido: 20000 },
    { mes: "Dez", recebido: 28000 },
  ];

  if (period === "all") {
    return baseData;
  }

  return baseData.slice(-Number(period));
  }, [period]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar userName="Admin" menuItems={menuItems} />

      <main className="flex-1 p-10 space-y-10">

        <DashboardHeader
          period={period}
          setPeriod={setPeriod}
        />

        <StatsCards
          totalEmprestado={stats.totalEmprestado}
          totalRecebido={stats.totalRecebido}
          totalAberto={stats.totalAberto}
          totalAtraso={stats.totalAtraso}
        />

        <FinancialChart data={chartData} />

        <div className="grid gap-10">
          <VencemHojeTable
            parcelas={vencemHoje}
            onPagar={handlePagar}
          />
          <AtrasadasTable parcelas={atrasadas} />
        </div>

      </main>
    </div>
  );
}