import { useEffect, useState } from "react";
import { useAuthSync } from "../context/AuthSyncContext";
import { fetchDashboardByRole } from "../services/dashboardService";
import { normalizeRole } from "../utils/roleUtils";

export function useDashboard(role) {
  const { hasActiveSession, isSessionReady, mongoUser, token, userId } =
    useAuthSync();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedRole = normalizeRole(role);
  const mongoRole = normalizeRole(mongoUser?.role);
  const canFetch =
    hasActiveSession &&
    isSessionReady &&
    Boolean(token) &&
    Boolean(userId) &&
    Boolean(normalizedRole) &&
    mongoRole === normalizedRole;

  useEffect(() => {
    if (!canFetch) {
      setLoading(true);
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadDashboard = async () => {
      try {
        const response = await fetchDashboardByRole(normalizedRole, token);
        if (cancelled) {
          return;
        }

        if (response?.success === false) {
          throw new Error(response.message || "Failed to load dashboard");
        }

        setData(response);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setData(null);
        setError(err.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [canFetch, normalizedRole, token, userId]);

  return {
    data,
    loading: !canFetch || loading,
    error,
    isReady: canFetch && !loading && Boolean(data),
  };
}
