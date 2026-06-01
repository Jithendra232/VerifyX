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

function DistributorDashboard() {
  const { data, loading, error } = useDashboard("distributor");

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const stats = data?.stats || {};

  return (
    <DashboardPage
      title="Distributor Inventory Desk"
      subtitle="Monitor inbound stock, outgoing transfers, and active inventory levels."
      actions={<DashboardAction label="Verify Products" to="/verify" />}
    >
      <StatsGrid
        items={[
          { label: "Inventory Units", value: stats.inventoryCount || 0, helper: "Products under custody", tone: "bg-blue-500" },
          { label: "Transfers Received", value: stats.receivedTransfersCount || 0, helper: "Inbound handoffs", tone: "bg-emerald-500" },
          { label: "Outgoing Transfers", value: stats.outgoingTransfersCount || 0, helper: "Downstream shipments", tone: "bg-indigo-500" },
          { label: "Pending Incoming", value: stats.pendingIncomingTransfersCount || 0, helper: "Needs approval", tone: "bg-amber-500" },
        ]}
      />

      <QuickActionGrid
        items={[
          { title: "Verify Stock", description: "Scan inventory QR labels before dispatch.", to: "/verify" },
          { title: "Review Inventory", description: "Check current ownership and quantities.", to: "/dashboard/distributor" },
          { title: "Manage Transfers", description: "Approve inbound requests and send products to retailers.", to: "/dashboard/transfers" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Inventory Movement",
            subtitle: "Inbound, outbound, and owned product counts.",
            type: "bar",
            color: "#2563eb",
            data: [
              { name: "Inventory", value: stats.inventoryCount || 0 },
              { name: "Received", value: stats.receivedTransfersCount || 0 },
              { name: "Outgoing", value: stats.outgoingTransfersCount || 0 },
              { name: "Listed", value: data?.productsCurrentlyOwned?.length || 0 },
            ],
          },
        ]}
      />

      <AnalyticsEnhancement />

      <Panel title="Products Currently Owned" subtitle="Current inventory under your custody.">
        <SimpleTable
          columns={[
            { key: "productName", header: "Product", render: (row) => row.productName || "-" },
            { key: "batchNumber", header: "Batch", render: (row) => row.batchNumber || "-" },
            { key: "quantity", header: "Quantity", render: (row) => row.quantity ?? 0 },
          ]}
          rows={(data?.productsCurrentlyOwned || []).map((item) => ({ ...item, id: item._id }))}
          emptyTitle="No inventory yet"
          emptyDescription="Accepted transfers will populate this inventory list."
        />
      </Panel>
    </DashboardPage>
  );
}

export default DistributorDashboard;
