import { useEffect, useState } from "react";
import { useDashboard } from "../../hooks/useDashboard";
import { fetchHighRiskProducts } from "../../services/riskService";
import { useAuthSync } from "../../context/AuthSyncContext";
import AnalyticsEnhancement from "../../components/dashboard/AnalyticsEnhancement";
import {
  DashboardAction,
  DashboardError,
  DashboardLoading,
  DashboardPage,
  AnalyticsGrid,
  Panel,
  QuickActionGrid,
  SimpleTable,
  StatsGrid,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";

function AdminDashboard() {
  const { data, loading, error } = useDashboard("admin");
  const { getToken, hasActiveSession, isSessionReady, token } = useAuthSync();
  const [highRisk, setHighRisk] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!hasActiveSession || !isSessionReady || !token || !getToken) return;
      try {
        const response = await fetchHighRiskProducts(getToken);
        if (!cancelled && response?.success) {
          setHighRisk(response.products || []);
        }
      } catch {
        if (!cancelled) setHighRisk([]);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [getToken, hasActiveSession, isSessionReady, token]);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const stats = data?.stats || {};
  const activityCount = data?.recentActivities?.length || 0;

  return (
    <DashboardPage
      title="Admin Operations Hub"
      subtitle="Platform-wide visibility across user growth, product flow, and risk signals."
      actions={<DashboardAction label="Verify Products" to="/verify" />}
    >
      <StatsGrid
        items={[
          { label: "Total Users", value: stats.totalUsers || 0, helper: "Synced platform accounts", tone: "bg-blue-500" },
          { label: "Registered Products", value: stats.totalProducts || 0, helper: "Tracked product records", tone: "bg-emerald-500" },
          { label: "Transfers", value: stats.totalTransfers || 0, helper: "Custody events recorded", tone: "bg-indigo-500" },
          { label: "Risk Alerts", value: highRisk.length, helper: "Products needing review", tone: "bg-red-500" },
        ]}
      />

      <QuickActionGrid
        items={[
          { title: "Run Verification", description: "Check a product ID or QR code before escalation.", to: "/verify" },
          { title: "Review Activity", description: "Watch platform events and operational status.", to: "/dashboard/admin" },
          { title: "Investigate Risk", description: "Prioritize products with suspicious verification signals.", to: "/dashboard/admin" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Platform Overview",
            subtitle: "Current product, transfer, and risk distribution.",
            type: "bar",
            data: [
              { name: "Products", value: stats.totalProducts || 0 },
              { name: "Transfers", value: stats.totalTransfers || 0 },
              { name: "Users", value: stats.totalUsers || 0 },
              { name: "Risk", value: highRisk.length },
            ],
          },
          {
            title: "Risk Overview",
            subtitle: "High-level health of monitored products.",
            type: "pie",
            data: [
              { name: "Normal", value: Math.max((stats.totalProducts || 0) - highRisk.length, 0), color: "#10b981" },
              { name: "Risk Alerts", value: highRisk.length, color: "#ef4444" },
              { name: "Recent Activity", value: activityCount, color: "#2563eb" },
            ],
          },
        ]}
      />

      <AnalyticsEnhancement />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Recent Platform Activity" subtitle="Latest operational events across the network.">
          <SimpleTable
            columns={[
              { key: "type", header: "Type", render: (row) => row.type || "-" },
              { key: "label", header: "Event", render: (row) => row.label || "-" },
              { key: "status", header: "Status", render: (row) => <StatusBadge tone="info">{row.status || "-"}</StatusBadge> },
            ]}
            rows={(data?.recentActivities || []).map((item, idx) => ({ ...item, id: `${item.type}-${idx}` }))}
            emptyTitle="No activity yet"
            emptyDescription="Platform activity will appear here when operations start."
          />
        </Panel>

        <Panel title="High Risk Products" subtitle="Products that need immediate investigation.">
          <SimpleTable
            columns={[
              { key: "productName", header: "Product", render: (row) => row.productName || "-" },
              { key: "batchNumber", header: "Batch", render: (row) => row.batchNumber || "-" },
              { key: "riskScore", header: "Risk Score", render: (row) => <StatusBadge tone="danger">{row.riskScore ?? "-"}</StatusBadge> },
            ]}
            rows={(highRisk || []).slice(0, 10).map((item) => ({ ...item, id: item.productId }))}
            emptyTitle="No high-risk products"
            emptyDescription="All monitored products are currently within acceptable risk limits."
          />
        </Panel>
      </div>
    </DashboardPage>
  );
}

export default AdminDashboard;
