import { Link } from "react-router-dom";
import FeedbackBanner from "../common/FeedbackBanner";
import EmptyState from "../common/EmptyState";
import { SkeletonCard } from "../common/Skeleton";

export function DashboardPage({ title, subtitle, actions, children }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

export function DashboardAction({ label, to, variant = "light" }) {
  const className =
    variant === "solid"
      ? "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
      : "rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10";

  return (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

export function StatsGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            {item.tone ? <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} /> : null}
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
          {item.helper ? <p className="mt-1 text-xs text-slate-500">{item.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function QuickActionGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.title}
          to={item.to}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function SimpleTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon="-" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardError({ message }) {
  return (
    <FeedbackBanner
      type="error"
      title="Dashboard unavailable"
      message={message || "We could not load your dashboard right now."}
    />
  );
}

export function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
