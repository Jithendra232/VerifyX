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

function ManufacturerDashboard() {
  const { data, loading, error } = useDashboard("manufacturer");

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const stats = data?.stats || {};

  return (
    <DashboardPage
      title="Manufacturer Control Center"
      subtitle="Track newly created products, outbound shipments, and quality status in one place."
      actions={
        <>
          <DashboardAction label="Add Product" to="/manufacturer/add-product" variant="solid" />
          <DashboardAction label="Verify Products" to="/verify" />
        </>
      }
    >
      <StatsGrid
        items={[
          { label: "Products Created", value: stats.totalProductsCreated || 0, helper: "Registered by your organization", tone: "bg-blue-500" },
          { label: "Transfers Made", value: stats.totalTransfersMade || 0, helper: "Outbound custody updates", tone: "bg-emerald-500" },
          { label: "Recent Products", value: data?.recentlyCreatedProducts?.length || 0, helper: "Visible product records", tone: "bg-indigo-500" },
          { label: "Pending Outgoing", value: stats.pendingOutgoingTransfersCount || 0, helper: "Awaiting receiver approval", tone: "bg-amber-500" },
        ]}
      />

      <QuickActionGrid
        items={[
          { title: "Add Product", description: "Create a new product record with batch and verification details.", to: "/manufacturer/add-product" },
          { title: "Verify Products", description: "Scan QR codes or manually validate a product ID.", to: "/verify" },
          { title: "Manage Transfers", description: "Send product transfer requests to distributors.", to: "/dashboard/transfers" },
        ]}
      />

      <AnalyticsGrid
        charts={[
          {
            title: "Product Output",
            subtitle: "Created products compared with recent transfer activity.",
            type: "area",
            data: [
              { name: "Created", value: stats.totalProductsCreated || 0 },
              { name: "Recent", value: data?.recentlyCreatedProducts?.length || 0 },
              { name: "Transfers", value: stats.totalTransfersMade || 0 },
              { name: "Outgoing", value: data?.recentOutgoingTransfers?.length || 0 },
            ],
          },
          {
            title: "Operational Mix",
            subtitle: "Current manufacturer workflow balance.",
            type: "pie",
            data: [
              { name: "Products", value: data?.recentlyCreatedProducts?.length || 0, color: "#2563eb" },
              { name: "Transfers", value: data?.recentOutgoingTransfers?.length || 0, color: "#10b981" },
            ],
          },
        ]}
      />

      <AnalyticsEnhancement />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Recently Created Products" subtitle="Most recent products registered to your organization.">
          <SimpleTable
            columns={[
              { key: "productName", header: "Product", render: (row) => row.productName || "-" },
              { key: "batchNumber", header: "Batch", render: (row) => row.batchNumber || "-" },
              { key: "verificationStatus", header: "Status", render: (row) => <StatusBadge tone="success">{row.verificationStatus || "-"}</StatusBadge> },
            ]}
            rows={(data?.recentlyCreatedProducts || []).map((item) => ({ ...item, id: item._id }))}
            emptyTitle="No products created"
            emptyDescription="Create your first product record to start supply chain tracking."
          />
        </Panel>

        <Panel title="Recent Outgoing Transfers" subtitle="Latest transfers sent downstream.">
          <SimpleTable
            columns={[
              { key: "product", header: "Product", render: (row) => row.product?.productName || "-" },
              { key: "recipient", header: "Recipient", render: (row) => row.toUser?.name || "-" },
              { key: "transferType", header: "Type", render: (row) => row.transferType || "-" },
            ]}
            rows={(data?.recentOutgoingTransfers || []).map((item) => ({ ...item, id: item._id }))}
            emptyTitle="No outgoing transfers"
            emptyDescription="Transferred products will show up here for monitoring."
          />
        </Panel>
      </div>
    </DashboardPage>
  );
}

export default ManufacturerDashboard;
