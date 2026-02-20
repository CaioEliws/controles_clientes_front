import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { RxDashboard } from "react-icons/rx";
import { FiAward, FiDollarSign, FiUsers } from "react-icons/fi";

export function Layout() {
  const menuItems = [
    { label: "Dashboard", path: "/", icon: <RxDashboard /> },
    { label: "Clientes", path: "/clientes", icon: <FiUsers /> },
    { label: "Assinaturas", path: "/assinaturas", icon: <FiAward /> },
    { label: "Financeiro", path: "/financeiro", icon: <FiDollarSign /> },
  ];

  return (
    <div className="flex">
      <Sidebar userName="Meu Sistema" menuItems={menuItems} />

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}