import { useAuthSync } from "../context/AuthSyncContext";

/** Backward-compatible hook — reads shared AuthSyncProvider state. */
export function useAppUser() {
  const {
    mongoUser,
    isHydrating,
    isLoaded,
    syncError,
    isSignedIn,
    hasActiveSession,
    clerkUser,
    getToken,
    refreshUser,
  } = useAuthSync();

  return {
    mongoUser,
    loading: !isLoaded || isHydrating,
    error: syncError,
    isSignedIn: hasActiveSession,
    clerkUser,
    getToken,
    refreshUser,
  };
}
