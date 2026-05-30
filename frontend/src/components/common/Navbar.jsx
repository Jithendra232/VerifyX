import { Link } from "react-router-dom";
import { useAuthSync } from "../../context/AuthSyncContext";
import { getDashboardPathForRole } from "../../utils/rolePaths";
import Logo from "./Logo";

function Navbar() {
  const { hasActiveSession, isSessionReady, mongoUser } = useAuthSync();
  const dashboardPath = hasActiveSession && isSessionReady ? getDashboardPathForRole(mongoUser?.role) : null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-4 text-sm">
          <Link to="/verify">Verify</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {dashboardPath && dashboardPath !== "/" ? (
            <Link to={dashboardPath} className="rounded bg-slate-900 px-3 py-2 text-white">
              Go To Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/sign-up" className="rounded bg-blue-600 px-3 py-2 text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
