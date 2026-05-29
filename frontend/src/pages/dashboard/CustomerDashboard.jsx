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
import AnalyticsEnhancement from "../../components/dashboard/AnalyticsEnhancement";
import { useDashboard } from "../../hooks/useDashboard";

function CustomerDashboard() {
  const { data, loading, error } = useDashboard("customer");

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const stats = data?.stats || {};

  return (
    <DashboardPage
      title="Customer Product Wallet"
      subtitle="Review your owned products and verification history."
      actions={<DashboardAction label="Verify a Product" to="/verify" variant="solid" />}
    >
      <StatsGrid
        items={[
          { label: "Owned Products", value: stats.ownedProductsCount || 0, helper: "Linked to your account", tone: "bg-blue-500" },
          { label: "Verified", value: stats.verifiedProductsCount || 0, helper: "Confirmed authentic", tone: "bg-emerald-500" },
          { label: "Suspicious Scans", value: stats.suspiciousScansCount || 0, helper: "Needs attention", tone: "bg-red-500" },
          { label: "Visible Products", value: data?.ownedProducts?.length || 0, helper: "Shown in this wallet", tone: "bg-indigo-500" },
        ]}
      />

      <QuickActionGrid
        items={[
          { title: "Verify a Product", description: "Scan QR codes or enter a product ID manually.", to: "/verify" },
          { title: "Review Wallet", description: "See products currently linked to your account.", to: "/dashboard/customer" },
          { title: "Check Suspicious Scans", description: "Re-verify products that may need investigation.", to: "/dashboard/customer" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Verification Health",
            subtitle: "Owned, verified, and suspicious product signals.",
            type: "pie",
            data: [
              { name: "Verified", value: stats.verifiedProductsCount || 0, color: "#10b981" },
              { name: "Suspicious", value: stats.suspiciousScansCount || 0, color: "#ef4444" },
              { name: "Owned", value: stats.ownedProductsCount || 0, color: "#2563eb" },
            ],
          },
        ]}
      />

      <AnalyticsEnhancement />

      <Panel title="Owned Products" subtitle="Current products linked to your account.">
        <SimpleTable
          columns={[
            { key: "productName", header: "Product", render: (row) => row.productName || "-" },
            { key: "batchNumber", header: "Batch", render: (row) => row.batchNumber || "-" },
            { key: "verificationStatus", header: "Status", render: (row) => <StatusBadge tone="success">{row.verificationStatus || "-"}</StatusBadge> },
          ]}
          rows={(data?.ownedProducts || []).map((item) => ({ ...item, id: item._id }))}
          emptyTitle="No owned products"
          emptyDescription="Once a transfer is completed to your account, products will appear here."
        />
      </Panel>
    </DashboardPage>
  );
}

export default CustomerDashboard;
