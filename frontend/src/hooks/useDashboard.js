import { useCallback, useEffect, useRef, useState } from "react";
import { AuthNotReadyError } from "../services/apiClient";
import { useAuthSync } from "../context/AuthSyncContext";
import { fetchDashboardByRole } from "../services/dashboardService";
import { normalizeRole } from "../utils/roleUtils";

export function useDashboard(role) {
  const { hasActiveSession, isSessionReady, getToken, userId } = useAuthSync();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef(null);
  const dataRef = useRef(null);

  const normalizedRole = normalizeRole(role);

  const canFetch =
    hasActiveSession &&
    isSessionReady &&
    Boolean(getToken) &&
    Boolean(userId) &&
    Boolean(normalizedRole);

  const loadDashboard = useCallback(async () => {
    if (!canFetch || !getToken) {
      return;
    }

    const fetchKey = `${normalizedRole}:${userId}`;
    if (isFetchingRef.current) {
      return;
    }

    if (lastFetchKeyRef.current === fetchKey && dataRef.current) {
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDashboardByRole(normalizedRole, getToken);

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load dashboard");
      }

      lastFetchKeyRef.current = fetchKey;
      dataRef.current = response;
      setData(response);
    } catch (err) {
      if (err instanceof AuthNotReadyError || err.isAuthError) {
        setData(null);
        setError(null);
        return;
      }

      setData(null);
      setError(err.message || "Failed to load dashboard");
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [canFetch, normalizedRole, userId, getToken]);

  useEffect(() => {
    if (!canFetch) {
      setLoading(true);
      setData(null);
      setError(null);
      lastFetchKeyRef.current = null;
      dataRef.current = null;
      return;
    }

    loadDashboard();
  }, [canFetch, normalizedRole, userId, loadDashboard]);

  const reload = useCallback(async () => {
    lastFetchKeyRef.current = null;
    dataRef.current = null;
    await loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading: !canFetch || loading,
    error,
    reload,
    isReady: canFetch && !loading && Boolean(data),
  };
}
