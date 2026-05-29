import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

export function StatusBadge({ children, tone = "neutral" }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
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

export function AnalyticsGrid({ charts }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {charts.map((chart) => (
        <Panel key={chart.title} title={chart.title} subtitle={chart.subtitle}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chart.type === "pie" ? (
                <PieChart>
                  <Pie data={chart.data} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={3}>
                    {chart.data.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || ["#2563eb", "#10b981", "#f59e0b", "#ef4444"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : chart.type === "bar" ? (
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={chart.color || "#2563eb"} radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke={chart.color || "#2563eb"} fill={chart.fill || "#dbeafe"} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function Timeline({ items, emptyTitle = "No history yet", emptyDescription = "Timeline events will appear here." }) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon="-" />;
  }

  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={item.id || index} className="relative pl-7">
          <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />
          {index !== items.length - 1 ? <span className="absolute left-[5px] top-5 h-full w-px bg-slate-200" /> : null}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-950">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-slate-500">{item.description}</p> : null}
              </div>
              {item.meta ? <span className="text-xs font-medium text-slate-400">{item.meta}</span> : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
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
