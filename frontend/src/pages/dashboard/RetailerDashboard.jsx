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
} from "../../components/dashboard/DashboardUI";
import AnalyticsEnhancement from "../../components/dashboard/AnalyticsEnhancement";
import { useDashboard } from "../../hooks/useDashboard";

function RetailerDashboard() {
  const { data, loading, error } = useDashboard("retailer");

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const stats = data?.stats || {};

  return (
    <DashboardPage
      title="Retailer Sales Dashboard"
      subtitle="Track inventory on hand and customer handoff history."
      actions={<DashboardAction label="Verify Products" to="/verify" />}
    >
      <StatsGrid
        items={[
          { label: "Inventory Units", value: stats.inventoryCount || 0, helper: "Available for sale", tone: "bg-blue-500" },
          { label: "Products Sold", value: stats.productsSold || 0, helper: "Customer handoffs", tone: "bg-emerald-500" },
          { label: "Customer Transfers", value: data?.customerTransfers?.length || 0, helper: "Recent transfer records", tone: "bg-indigo-500" },
          { label: "Verification Ready", value: "QR", helper: "Scan before checkout", tone: "bg-amber-500" },
        ]}
      />

      <QuickActionGrid
        items={[
          { title: "Verify at Counter", description: "Scan QR codes before completing customer handoff.", to: "/verify" },
          { title: "Review Transfers", description: "Check recent customer deliveries and ownership movement.", to: "/dashboard/retailer" },
          { title: "Monitor Inventory", description: "Keep product custody aligned with current stock.", to: "/dashboard/retailer" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Retail Flow",
            subtitle: "Inventory and customer transfer activity.",
            type: "bar",
            color: "#10b981",
            data: [
              { name: "Inventory", value: stats.inventoryCount || 0 },
              { name: "Sold", value: stats.productsSold || 0 },
              { name: "Transfers", value: data?.customerTransfers?.length || 0 },
            ],
          },
        ]}
      />

      <AnalyticsEnhancement />

      <Panel title="Customer Transfers" subtitle="Recent deliveries from your store to customers.">
        <SimpleTable
          columns={[
            { key: "product", header: "Product", render: (row) => row.product?.productName || "-" },
            { key: "customer", header: "Customer", render: (row) => row.toUser?.name || "-" },
            { key: "transferType", header: "Type", render: (row) => row.transferType || "-" },
          ]}
          rows={(data?.customerTransfers || []).map((item) => ({ ...item, id: item._id }))}
          emptyTitle="No customer transfers"
          emptyDescription="Transfers to end customers will appear here."
        />
      </Panel>
    </DashboardPage>
  );
}

export default RetailerDashboard;
