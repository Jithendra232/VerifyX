import { useMemo, useState } from "react";
import FilterToolbar from "../../components/common/FilterToolbar";
import Pagination from "../../components/common/Pagination";
import {
  DashboardError,
  DashboardLoading,
  DashboardPage,
  Panel,
  SimpleTable,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";
import { useDashboard } from "../../hooks/useDashboard";
import { usePagination } from "../../hooks/usePagination";

function AuditLogsPage() {
  const { data, loading, error } = useDashboard("admin");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const logs = useMemo(
    () =>
      (data?.recentActivities || []).map((item, index) => ({
        id: `${item.type || "activity"}-${index}`,
        type: item.type || "activity",
        event: item.label || "Platform event",
        status: item.status || "recorded",
        actor: item.actor || item.user || "System",
      })),
    [data]
  );

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase();
    return logs.filter((log) => {
      const matchesSearch = `${log.type} ${log.event} ${log.status} ${log.actor}`.toLowerCase().includes(query);
      const matchesType = type === "all" || log.type === type;
      return matchesSearch && matchesType;
    });
  }, [logs, search, type]);
  const { page, totalPages, paginatedItems, setPage, resetPage } = usePagination(filteredLogs, 8);
  const typeOptions = [
    { value: "all", label: "All types" },
    ...Array.from(new Set(logs.map((log) => log.type))).map((value) => ({ value, label: value })),
  ];

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  return (
    <DashboardPage title="Audit Logs" subtitle="Admin-friendly view of recent platform events and operational activity.">
      <Panel title="Filter Logs" subtitle="Search by event, type, actor, or status.">
        <FilterToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          filter={type}
          onFilterChange={(value) => {
            setType(value);
            resetPage();
          }}
          placeholder="Search audit logs..."
          filterOptions={typeOptions}
        />
      </Panel>

      <Panel title="Structured Logs" subtitle="Paginated operational events from the admin dashboard feed.">
        <div className="space-y-4">
          <SimpleTable
            columns={[
              { key: "type", header: "Type", render: (row) => row.type },
              { key: "event", header: "Event", render: (row) => row.event },
              { key: "actor", header: "Actor", render: (row) => row.actor },
              { key: "status", header: "Status", render: (row) => <StatusBadge tone="info">{row.status}</StatusBadge> },
            ]}
            rows={paginatedItems}
            emptyTitle="No audit logs"
            emptyDescription="Recent platform events will appear here when available."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Panel>
    </DashboardPage>
  );
}

export default AuditLogsPage;
