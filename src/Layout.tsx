import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/SideBar";
import { RxDashboard } from "react-icons/rx";
import { FiCalendar, FiDollarSign, FiUsers } from "react-icons/fi";

export function Layout() {
  const menuItems = [
    { label: "Dashboard", path: "/", icon: <RxDashboard /> },
    { label: "Clientes", path: "/clientes", icon: <FiUsers /> },
    { label: "Parcelas", path: "/parcelas", icon: <FiCalendar /> },
    { label: "Emprestimo", path: "/emprestimo", icon: <FiDollarSign /> },
    { label: "Simulação", path: "/simulacao", icon: <FiDollarSign /> },
    { label: "Backup / Import", path: "/backup", icon: <FiDollarSign /> },
  ];

  return (
    <div className="flex">
      <Sidebar userName="Meu Dashboard" menuItems={menuItems} />

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}