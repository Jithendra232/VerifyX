import { useEffect, useMemo, useState } from "react";
import FilterToolbar from "../../components/common/FilterToolbar";
import Pagination from "../../components/common/Pagination";
import {
  DashboardPage,
  Panel,
  SimpleTable,
  StatsGrid,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";
import VerificationLocationMap from "../../components/maps/VerificationLocationMap";
import { useAuthSync } from "../../context/AuthSyncContext";
import { usePagination } from "../../hooks/usePagination";
import { fetchVerificationLogs } from "../../services/verificationService";
import { getVerificationHistory } from "../../utils/verificationHistory";

function getTone(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("suspicious") || value.includes("fake") || value.includes("invalid")) return "danger";
  if (value.includes("pending")) return "warning";
  return "success";
}

function VerificationHistoryPage() {
  const { getToken, hasActiveSession, isSessionReady, token } = useAuthSync();
  const [localHistory] = useState(() => getVerificationHistory());
  const [serverHistory, setServerHistory] = useState([]);
  const [serverError, setServerError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      if (!hasActiveSession || !isSessionReady || !token || !getToken) return;

      try {
        const response = await fetchVerificationLogs(getToken, { limit: 50 });
        if (!cancelled) {
          setServerHistory(response.logs || []);
          setServerError("");
        }
      } catch (err) {
        if (!cancelled) {
          setServerHistory([]);
          setServerError(err.message || "Failed to load server verification logs");
        }
      }
    };

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, [getToken, hasActiveSession, isSessionReady, token]);

  const history = useMemo(() => {
    if (!serverHistory.length) return localHistory;

    return serverHistory.map((record) => ({
      id: record._id,
      productId: record.product?.batchNumber || record.product?._id || record.qrData || "-",
      productName: record.product?.productName,
      source: record.scannedBy?.role || "scan",
      status: record.status || record.result,
      message: record.message,
      timestamp: record.createdAt,
      locationData: record.locationData,
      result: record.result,
    }));
  }, [localHistory, serverHistory]);

  const filteredHistory = useMemo(() => {
    const query = search.toLowerCase();
    return history.filter((record) => {
      const matchesSearch = `${record.productId} ${record.message} ${record.source}`.toLowerCase().includes(query);
      const recordStatus = String(record.status || "").toLowerCase();
      const matchesStatus = status === "all" || recordStatus.includes(status);
      return matchesSearch && matchesStatus;
    });
  }, [history, search, status]);
  const { page, totalPages, paginatedItems, setPage, resetPage } = usePagination(filteredHistory, 8);
  const suspiciousCount = history.filter((record) => getTone(record.status) === "danger").length;

  return (
    <DashboardPage title="Verification History" subtitle="Recent manual and QR verification scans with server logs when available.">
      <StatsGrid
        items={[
          { label: "Total Scans", value: history.length, helper: "Stored locally", tone: "bg-blue-500" },
          { label: "Verified", value: Math.max(history.length - suspiciousCount, 0), helper: "Successful checks", tone: "bg-emerald-500" },
          { label: "Suspicious", value: suspiciousCount, helper: "Needs review", tone: "bg-red-500" },
        ]}
      />

      <Panel title="Search Scans" subtitle="Filter by product ID, source, or status.">
        {serverError ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{serverError}</p> : null}
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
          placeholder="Search verification history..."
          filterOptions={[
            { value: "all", label: "All statuses" },
            { value: "verified", label: "Verified" },
            { value: "suspicious", label: "Suspicious" },
          ]}
        />
      </Panel>

      <Panel title="Recent Scans" subtitle="Status, source, and timestamp for verification checks.">
        <div className="space-y-4">
          <SimpleTable
            columns={[
              { key: "productId", header: "Product ID", render: (row) => row.productId || "-" },
              { key: "productName", header: "Product", render: (row) => row.productName || "-" },
              { key: "source", header: "Source", render: (row) => row.source || "-" },
              { key: "status", header: "Status", render: (row) => <StatusBadge tone={getTone(row.status)}>{row.status || "-"}</StatusBadge> },
              { key: "timestamp", header: "Timestamp", render: (row) => row.timestamp ? new Date(row.timestamp).toLocaleString() : "-" },
            ]}
            rows={paginatedItems}
            emptyTitle="No verification scans"
            emptyDescription="Manual and QR verification results will appear here after scans."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Panel>

      <Panel title="Scan Locations" subtitle="Locations are captured only when browser permission is granted.">
        <VerificationLocationMap
          locations={history
            .filter((record) => record.locationData)
            .map((record) => ({
              ...record.locationData,
              id: record.id,
              label: record.productName || record.productId,
              severity: getTone(record.status) === "danger" ? "HIGH" : "LOW",
              timestamp: record.timestamp,
            }))}
        />
      </Panel>
    </DashboardPage>
  );
}

export default VerificationHistoryPage;
