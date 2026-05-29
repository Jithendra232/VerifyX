import { useEffect, useState } from "react";
import { useAuthSync } from "../../context/AuthSyncContext";
import { fetchAnalyticsSummary } from "../../services/analyticsService";
import VerificationLocationMap from "../maps/VerificationLocationMap";
import { AnalyticsGrid, Panel, StatsGrid } from "./DashboardUI";

function AnalyticsEnhancement() {
  const { getToken, hasActiveSession, isSessionReady, token } = useAuthSync();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!hasActiveSession || !isSessionReady || !token || !getToken) return;

      try {
        const response = await fetchAnalyticsSummary(getToken);
        if (!cancelled && response?.success) setAnalytics(response);
      } catch {
        if (!cancelled) setAnalytics(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [getToken, hasActiveSession, isSessionReady, token]);

  if (!analytics) return null;

  const cards = analytics.cards || {};

  return (
    <div className="space-y-6">
      <StatsGrid
        items={[
          { label: "Verifications", value: cards.totalVerifications || 0, helper: "Role-specific scans", tone: "bg-blue-500" },
          { label: "Fraud Rate", value: `${cards.fraudRate || 0}%`, helper: "Suspicious or fake scans", tone: "bg-red-500" },
          { label: "Fake Scans", value: cards.fakeScans || 0, helper: "Invalid QR attempts", tone: "bg-amber-500" },
          { label: "Transfers", value: cards.totalTransfers || 0, helper: "Custody movements", tone: "bg-emerald-500" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Verification Trends",
            subtitle: "Recent scan volume and suspicious activity.",
            type: "area",
            data: analytics.verificationTrends || [],
            color: "#2563eb",
            fill: "#dbeafe",
          },
          {
            title: "Fraud Statistics",
            subtitle: "Authentic, suspicious, and fake scan distribution.",
            type: "pie",
            data: analytics.fraudStatistics || [],
          },
          {
            title: "Transfer Metrics",
            subtitle: "Transfer counts by movement type.",
            type: "bar",
            data: analytics.transferMetrics || [],
            color: "#10b981",
          },
        ]}
      />

      <Panel title="Fraud Hotspots" subtitle="Locations captured from verification scans.">
        <VerificationLocationMap locations={analytics.hotspots || []} />
      </Panel>
    </div>
  );
}

export default AnalyticsEnhancement;
