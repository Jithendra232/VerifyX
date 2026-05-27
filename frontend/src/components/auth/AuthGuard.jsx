import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../common/Loader";
import { useAuthSync } from "../../context/AuthSyncContext";

function AuthGuard({ children }) {
  const { isLoaded, hasActiveSession, isHydrating, isSessionReady, syncError } = useAuthSync();
  const location = useLocation();

  if (!isLoaded || isHydrating) {
    return <PageLoader message="Preparing your session..." />;
  }

  if (hasActiveSession && !isSessionReady && !syncError) {
    return <PageLoader message="Preparing your session..." />;
  }

  if (!hasActiveSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthGuard;
