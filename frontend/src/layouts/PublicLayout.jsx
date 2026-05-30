import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import PublicFooter from "../components/common/PublicFooter";

function PublicLayout() {
  const { pathname } = useLocation();
  const selfContainedRoutes = ["/", "/verify"];
  const authRoute = pathname.startsWith("/login") || pathname.startsWith("/sign-up");
  const showShell = !selfContainedRoutes.includes(pathname) && !authRoute;

  return (
    <div className="min-h-screen bg-slate-50">
      {showShell ? <Navbar /> : null}
      <Outlet />
      {showShell ? <PublicFooter /> : null}
    </div>
  );
}

export default PublicLayout;
