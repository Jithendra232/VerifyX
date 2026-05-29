import { Outlet } from "react-router-dom";
import DashboardUserButton from "../components/auth/DashboardUserButton";
import Sidebar from "../components/common/Sidebar";
import NotificationCenter from "../components/notifications/NotificationCenter";
import { useAppUser } from "../hooks/useAppUser";

function DashboardLayout() {
  const { mongoUser } = useAppUser();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={mongoUser?.role} />
      <div className="flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Supply Chain Dashboard</p>
              <p className="text-xs text-slate-500">{mongoUser?.name || "User"}</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <DashboardUserButton />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
