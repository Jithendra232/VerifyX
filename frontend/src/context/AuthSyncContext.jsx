import { useAuth, useUser } from "@clerk/clerk-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { syncUser } from "../services/userService";
import {
  clearAuthSyncCache,
  syncMongoUserOnce,
} from "../utils/authSyncCache";

const AuthSyncContext = createContext(null);

export function AuthSyncProvider({ children }) {
  const { isLoaded, isSignedIn, getToken, userId, sessionId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [token, setToken] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const lastSyncedSessionRef = useRef(null);
  const clerkUserRef = useRef(user);
  clerkUserRef.current = user;

  const hasActiveSession =
    isLoaded &&
    isSignedIn &&
    Boolean(userId) &&
    Boolean(sessionId) &&
    isUserLoaded &&
    Boolean(user?.id);

  const resetAuthState = useCallback(() => {
    clearAuthSyncCache();
    lastSyncedSessionRef.current = null;
    setToken(null);
    setMongoUser(null);
    setSyncError(null);
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!hasActiveSession) {
      resetAuthState();
      return;
    }

    const syncSessionKey = `${userId}:${sessionId}`;
    if (lastSyncedSessionRef.current === syncSessionKey && mongoUser?.clerkId === userId) {
      return;
    }

    const clerkUser = clerkUserRef.current;
    if (!clerkUser || clerkUser.id !== userId) {
      return;
    }

    let cancelled = false;
    const hydrateSession = async () => {
      setSyncing(true);
      setSyncError(null);

      try {
        const sessionToken = await getToken();
        if (!sessionToken) {
          throw new Error("Session token not available");
        }

        if (cancelled) {
          return;
        }

        setToken(sessionToken);

        const data = await syncMongoUserOnce(clerkUser, () =>
          syncUser({
            clerkId: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress,
          })
        );

        if (cancelled) {
          return;
        }

        lastSyncedSessionRef.current = syncSessionKey;
        setMongoUser(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        lastSyncedSessionRef.current = null;
        setToken(null);
        setMongoUser(null);
        setSyncError(error.message || "Failed to sync user");
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    };

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, hasActiveSession, userId, sessionId, getToken, mongoUser?.clerkId, resetAuthState]);

  const refreshUser = useCallback(async () => {
    clearAuthSyncCache();
    lastSyncedSessionRef.current = null;

    const clerkUser = clerkUserRef.current;
    if (!hasActiveSession || !clerkUser || !token) {
      return;
    }

    setSyncing(true);
    setSyncError(null);

    try {
      const data = await syncMongoUserOnce(clerkUser, () =>
        syncUser({
          clerkId: clerkUser.id,
          name: clerkUser.fullName || clerkUser.username || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress,
        })
      );
      setMongoUser(data);
      lastSyncedSessionRef.current = `${userId}:${sessionId}`;
    } catch (error) {
      setMongoUser(null);
      setSyncError(error.message || "Failed to sync user");
    } finally {
      setSyncing(false);
    }
  }, [hasActiveSession, token, userId, sessionId]);

  const value = useMemo(() => {
    const isSessionReady =
      hasActiveSession &&
      Boolean(mongoUser) &&
      Boolean(token) &&
      mongoUser?.clerkId === userId &&
      !syncing &&
      !syncError;

    const isHydrating = !isLoaded || (hasActiveSession && !isSessionReady);

    return {
      isLoaded,
      isSignedIn,
      hasActiveSession,
      isHydrating,
      isSessionReady,
      token,
      mongoUser,
      syncing,
      syncError,
      clerkUser: user,
      userId,
      getToken,
      refreshUser,
      resetAuthState,
    };
  }, [
    isLoaded,
    isSignedIn,
    hasActiveSession,
    token,
    mongoUser,
    syncing,
    syncError,
    user,
    userId,
    getToken,
    refreshUser,
    resetAuthState,
  ]);

  return (
    <AuthSyncContext.Provider value={value}>{children}</AuthSyncContext.Provider>
  );
}

export function useAuthSync() {
  const context = useContext(AuthSyncContext);

  if (!context) {
    throw new Error("useAuthSync must be used within AuthSyncProvider");
  }

  return context;
}
