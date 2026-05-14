import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { USER_ROLES } from "@/constants/roles";
import { menuConfig } from "@/config/menuConfig";
import { Logo } from "./Logo";
import { cn } from "@/utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user } = useAppSelector((s) => s.auth);
  const primaryRole =
    user?.roles[0] ??
    (user?.roles.includes(USER_ROLES.ADMIN)
      ? USER_ROLES.ADMIN
      : user?.roles.includes(USER_ROLES.CUSTOMER)
        ? USER_ROLES.CUSTOMER
        : USER_ROLES.DELIVERY_PERSONNEL);

  const items = primaryRole ? (menuConfig[primaryRole] ?? []) : [];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
