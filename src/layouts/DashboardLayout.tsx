import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { cn } from "@/utils/cn";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);


  function toggleSidebar() {
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, part of flex on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 md:relative md:flex md:shrink-0",
          mobileOpen ? "flex" : "hidden md:flex"
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
