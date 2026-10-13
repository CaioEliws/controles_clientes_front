import { NavLink, Outlet } from "react-router-dom";
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
    { label: "Documentos", path: "/documentos", icon: <FiFileText /> },
    { label: "Simulação", path: "/simulacao", icon: <FiBarChart2 /> },
    {
      label: "Relatório Parcelas",
      path: "/relatorio-parcelas",
      icon: <FiFileText />,
    },
    { label: "Backup / Import", path: "/backup", icon: <FiDownloadCloud /> },
  ];

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background md:flex-row">
      <div className="hidden md:block"><Sidebar userName="Meu Dashboard" menuItems={menuItems} /></div>
      <nav aria-label="Menu principal mobile" className="flex shrink-0 gap-2 overflow-x-auto border-b p-2 md:hidden">
        {[...menuItems, { label: "Configurações", path: "/configuracoes", icon: null }].map((item) => <NavLink key={item.path} to={item.path} end className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{item.icon}{item.label}</NavLink>)}
      </nav>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden md:h-screen">
        <Outlet />
      </main>
    </div>
  );
}
