import { useEffect, useMemo, useState } from "react";
import FilterToolbar from "../../components/common/FilterToolbar";
import Pagination from "../../components/common/Pagination";
import ProductJourneyTimeline from "../../components/dashboard/ProductJourneyTimeline";
import SupplyChainIntelligencePanel from "../../components/dashboard/SupplyChainIntelligencePanel";
import {
  DashboardError,
  DashboardLoading,
  DashboardPage,
  Panel,
  SimpleTable,
  StatusBadge,
  Timeline,
} from "../../components/dashboard/DashboardUI";
import SupplyChainRouteMap from "../../components/maps/SupplyChainRouteMap";
import VerificationLocationMap from "../../components/maps/VerificationLocationMap";
import { useAuthSync } from "../../context/AuthSyncContext";
import { useDashboard } from "../../hooks/useDashboard";
import { usePagination } from "../../hooks/usePagination";
import { fetchProductJourney } from "../../services/productJourneyService";
import { collectDashboardProducts, collectDashboardTransfers } from "../../utils/dashboardRecords";
import { normalizeRole } from "../../utils/roleUtils";

function ProductHistoryPage() {
  const { getToken, mongoUser } = useAuthSync();
  const role = normalizeRole(mongoUser?.role) || "customer";
  const { data, loading, error } = useDashboard(role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [journey, setJourney] = useState(null);
  const [journeyError, setJourneyError] = useState("");

  const products = useMemo(() => collectDashboardProducts(role, data), [data, role]);
  const transfers = useMemo(() => collectDashboardTransfers(role, data), [data, role]);
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = `${product.productName} ${product.batchNumber}`.toLowerCase().includes(query);
      const matchesStatus = status === "all" || product.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);
  const { page, totalPages, paginatedItems, setPage, resetPage } = usePagination(filteredProducts, 6);

  useEffect(() => {
    const firstId = filteredProducts[0]?.id;
    if (!selectedProductId && firstId) {
      setSelectedProductId(firstId);
    }
  }, [filteredProducts, selectedProductId]);

  useEffect(() => {
    let cancelled = false;

    const loadJourney = async () => {
      if (!selectedProductId || !getToken) return;

      setJourneyError("");
      try {
        const response = await fetchProductJourney(selectedProductId, getToken);
        if (!cancelled) setJourney(response);
      } catch (err) {
        if (!cancelled) {
          setJourney(null);
          setJourneyError(err.message || "Failed to load product journey");
        }
      }
    };

    loadJourney();
    return () => {
      cancelled = true;
    };
  }, [getToken, selectedProductId]);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  const timelineItems = transfers.slice(0, 8).map((item) => ({
    id: item.id,
    title: item.productName,
    description: `${item.from} -> ${item.to}`,
    meta: item.type,
  }));

  return (
    <DashboardPage title="Product History" subtitle="Review product custody, ownership flow, and transfer records.">
      <Panel title="Search Products" subtitle="Filter product history by name, batch, or status.">
        <FilterToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          filter={status}
          onFilterChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          placeholder="Search products or batches..."
          filterOptions={[
            { value: "all", label: "All statuses" },
            { value: "verified", label: "Verified" },
            { value: "tracked", label: "Tracked" },
            { value: "pending", label: "Pending" },
          ]}
        />
      </Panel>

      <Panel title="Products" subtitle="Current product records available to your role.">
        <div className="space-y-4">
          <SimpleTable
            columns={[
              { key: "productName", header: "Product", render: (row) => row.productName },
              { key: "batchNumber", header: "Batch", render: (row) => row.batchNumber },
              { key: "status", header: "Status", render: (row) => <StatusBadge tone="info">{row.status}</StatusBadge> },
              {
                key: "journey",
                header: "Journey",
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => setSelectedProductId(row.id)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                ),
              },
            ]}
            rows={paginatedItems}
            emptyTitle="No matching products"
            emptyDescription="Try adjusting your search or status filter."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Panel>

      <Panel title="Ownership Timeline" subtitle="Recent custody and transfer events.">
        {journey?.currentOwner ? (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Current Owner</p>
            <p className="mt-1 font-semibold text-slate-950">
              {journey.currentOwner.name || journey.currentOwner.email || "Unknown user"}
            </p>
            <p className="text-sm capitalize text-slate-600">{journey.currentOwner.role || "role unavailable"}</p>
          </div>
        ) : null}
        {journeyError ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{journeyError}</p>
        ) : journey ? (
          <ProductJourneyTimeline journey={journey} />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </Panel>

      <Panel title="Supply Chain Route" subtitle="Manufacturer to customer route with geo events from transfers and verifications.">
        <SupplyChainRouteMap
          mapPoints={journey?.mapPoints || []}
          routeChain={journey?.routeChain || []}
        />
      </Panel>

      <Panel title="Fraud & Counterfeit Intelligence" subtitle="Rule-based risk scoring, route anomalies, and investigator explanations.">
        <SupplyChainIntelligencePanel intelligence={journey?.intelligence} />
      </Panel>

      <Panel title="Verification Locations" subtitle="Scan locations and risk hotspots for the selected product.">
        <VerificationLocationMap
          locations={(journey?.mapPoints?.length
            ? journey.mapPoints
            : (journey?.verifications || [])
                .filter((log) => log.locationData)
                .map((log) => ({
                  ...log.locationData,
                  id: log._id,
                  label: log.product?.productName || journey?.product?.productName,
                  severity: log.result === "AUTHENTIC" ? "LOW" : "HIGH",
                  timestamp: log.createdAt,
                })))}
        />
      </Panel>
    </DashboardPage>
  );
}

export default ProductHistoryPage;
