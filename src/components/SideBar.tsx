import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  userName: string;
  menuItems: MenuItem[];
}

export function Sidebar({ userName, menuItems }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-background border-r flex flex-col">
            <div className="h-32 flex items-center justify-center border-b px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {userName}
        </h1>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all text-base",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && (
                <span className="text-lg">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}