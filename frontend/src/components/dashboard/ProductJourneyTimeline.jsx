import { StatusBadge } from "./DashboardUI";

function actorLabel(user) {
  if (!user) return "Unknown user";
  return `${user.name || user.email || "User"}${user.role ? ` (${user.role})` : ""}`;
}

function ProductJourneyTimeline({ journey }) {
  const items = journey?.timeline || [];

  if (!items.length) {
    return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No ownership timeline is available yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={item.id || index} className="relative pl-8">
          <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-blue-50" />
          {index !== items.length - 1 ? <span className="absolute left-[7px] top-6 h-full w-px bg-slate-200" /> : null}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{item.title || item.type}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.fromUser ? `${actorLabel(item.fromUser)} -> ${actorLabel(item.toUser)}` : actorLabel(item.owner)}
                </p>
                {item.notes ? <p className="mt-2 text-sm text-slate-600">{item.notes}</p> : null}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <StatusBadge tone={item.status === "COMPLETED" ? "success" : "info"}>{item.status || item.type}</StatusBadge>
                <span className="text-xs text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default ProductJourneyTimeline;
