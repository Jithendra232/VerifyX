import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSync } from "../../context/AuthSyncContext";
import { getAuthRedirectTarget, logAuthDebug } from "../../utils/authDebug";

const AUTH_ROUTE_PREFIXES = ["/login", "/sign-up"];

const isAuthCompletionRoute = (pathname) =>
  AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

function PostAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isLoaded,
    hasActiveSession,
    isSessionReady,
    mongoUser,
    userId,
  } = useAuthSync();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!hasActiveSession) {
      hasRedirectedRef.current = false;
    }
  }, [hasActiveSession, userId]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!hasActiveSession || !isSessionReady || !mongoUser?.role) {
      return;
    }

    const dashboardPath = getAuthRedirectTarget(mongoUser);
    if (!dashboardPath) {
      logAuthDebug("redirect-skipped", {
        reason: "missing-or-invalid-role",
        role: mongoUser?.role,
      });
      return;
    }

    if (!isAuthCompletionRoute(location.pathname)) {
      return;
    }

    if (hasRedirectedRef.current) {
      return;
    }

    if (location.pathname === dashboardPath) {
      return;
    }

    logAuthDebug("redirect", {
      role: mongoUser.role,
      target: dashboardPath,
      email: mongoUser.email,
    });

    hasRedirectedRef.current = true;
    navigate(dashboardPath, { replace: true });
  }, [
    isLoaded,
    hasActiveSession,
    isSessionReady,
    mongoUser?.role,
    userId,
    location.pathname,
    navigate,
  ]);

  return null;
}

export default PostAuthRedirect;
