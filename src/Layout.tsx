import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/SideBar";
import { RxDashboard } from "react-icons/rx";
import {
  FiUsers,
  FiLayers,
  FiTrendingUp,
  FiBarChart2,
  FiDownloadCloud,
  FiFileText,
} from "react-icons/fi";

export function Layout() {
  const menuItems = [
    { label: "Dashboard", path: "/", icon: <RxDashboard /> },
    { label: "Clientes", path: "/clientes", icon: <FiUsers /> },
    { label: "Parcelas", path: "/parcelas", icon: <FiLayers /> },
    { label: "Empréstimo", path: "/emprestimo", icon: <FiTrendingUp /> },
    { label: "Simulação", path: "/simulacao", icon: <FiBarChart2 /> },
    {
      label: "Relatório Parcelas",
      path: "/relatorio-parcelas",
      icon: <FiFileText />,
    },
    { label: "Backup / Import", path: "/backup", icon: <FiDownloadCloud /> },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName="Meu Dashboard" menuItems={menuItems} />

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden h-screen">
        <Outlet />
      </main>
    </div>
  );
}