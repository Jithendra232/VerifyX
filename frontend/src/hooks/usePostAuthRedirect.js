import { useAuthSync } from "../context/AuthSyncContext";
import { getAuthRedirectTarget } from "../utils/authDebug";

export function usePostAuthRedirect() {
  const {
    isLoaded,
    isSignedIn,
    hasActiveSession,
    isHydrating,
    isSessionReady,
    mongoUser,
    syncError,
  } = useAuthSync();

  const redirectTarget = getAuthRedirectTarget(mongoUser);

  const canRedirectToDashboard =
    isLoaded &&
    hasActiveSession &&
    isSessionReady &&
    Boolean(mongoUser) &&
    Boolean(redirectTarget);

  const hasMissingRole =
    hasActiveSession &&
    isSessionReady &&
    Boolean(mongoUser) &&
    !redirectTarget;

  return {
    isLoaded,
    isSignedIn,
    hasActiveSession,
    isWaitingForSession: !isLoaded,
    isSyncingUser: hasActiveSession && isHydrating,
    canRedirectToDashboard,
    hasMissingRole,
    isSessionReady,
    syncError,
    mongoUser,
    redirectTarget,
  };
}
