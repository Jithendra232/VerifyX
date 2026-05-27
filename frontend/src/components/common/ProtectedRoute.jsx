import { Navigate } from "react-router-dom";
import FeedbackBanner from "./FeedbackBanner";
import { PageLoader } from "./Loader";
import { useAuthSync } from "../../context/AuthSyncContext";
import { getAuthRedirectTarget } from "../../utils/authDebug";
import { hasAllowedRole } from "../../utils/roleUtils";

function ProtectedRoute({ allowedRoles, children }) {
  const { isLoaded, hasActiveSession, isHydrating, isSessionReady, mongoUser, syncError } = useAuthSync();

  if (!isLoaded || isHydrating) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  if (!hasActiveSession) {
    return <Navigate to="/login" replace />;
  }

  if (!isSessionReady) {
    if (syncError) {
      return (
        <div className="mx-auto max-w-lg p-8">
          <FeedbackBanner
            type="error"
            title="Unable to prepare your account"
            message={syncError}
          />
        </div>
      );
    }

    return <PageLoader message="Loading your dashboard..." />;
  }

  if (!mongoUser?.role) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <FeedbackBanner
          type="warning"
          title="Account role missing"
          message="Your account synced but has no assigned role. Contact an administrator."
        />
      </div>
    );
  }

  const userDashboardPath = getAuthRedirectTarget(mongoUser);

  if (!userDashboardPath) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <FeedbackBanner
          type="warning"
          title="Invalid account role"
          message={`Role "${mongoUser.role}" is not configured for dashboard access.`}
        />
      </div>
    );
  }

  const roleAllowed = hasAllowedRole(mongoUser.role, allowedRoles);

  if (!roleAllowed) {
    const correctPath = userDashboardPath;
    if (correctPath) {
      return <Navigate to={correctPath} replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
