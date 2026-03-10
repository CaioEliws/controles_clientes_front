import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/SideBar";
import { RxDashboard } from "react-icons/rx";
import {
  FiUsers,
  FiLayers,
  FiTrendingUp,
  FiBarChart2,
  FiDownloadCloud,
} from "react-icons/fi";

export function Layout() {
  const menuItems = [
    { label: "Dashboard", path: "/", icon: <RxDashboard /> },
    { label: "Clientes", path: "/clientes", icon: <FiUsers /> },
    { label: "Parcelas", path: "/parcelas", icon: <FiLayers /> },
    { label: "Empréstimo", path: "/emprestimo", icon: <FiTrendingUp /> },
    { label: "Simulação", path: "/simulacao", icon: <FiBarChart2 /> },
    { label: "Backup / Import", path: "/backup", icon: <FiDownloadCloud /> },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar userName="Meu Dashboard" menuItems={menuItems} />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}