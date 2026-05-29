import { useEffect, useMemo, useState } from "react";
import { useAuthSync } from "../../context/AuthSyncContext";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../../services/socketService";

function toneForSeverity(severity) {
  if (severity === "CRITICAL" || severity === "HIGH") return "border-red-200 bg-red-50 text-red-700";
  if (severity === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-white text-slate-700";
}

function NotificationCenter() {
  const { hasActiveSession, isSessionReady, mongoUser, token, userId } = useAuthSync();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!hasActiveSession || !isSessionReady || !token || !userId) {
      disconnectNotificationSocket();
      setItems([]);
      return undefined;
    }

    const socket = connectNotificationSocket({
      userId,
      role: mongoUser?.role,
      token,
      onNotification: (notification) => {
        setItems((current) => [
          notification,
          ...current.filter((item) => item.id !== notification.id),
        ].slice(0, 8));
      },
    });

    return () => {
      socket?.off("notification");
      disconnectNotificationSocket();
    };
  }, [hasActiveSession, isSessionReady, mongoUser?.role, token, userId]);

  useEffect(() => {
    if (!hasActiveSession) {
      disconnectNotificationSocket();
    }
  }, [hasActiveSession]);

  const unreadCount = useMemo(() => items.length, [items]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        Alerts
        {unreadCount ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-950">Real-time alerts</p>
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Clear
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-auto">
            {items.length ? items.map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 ${toneForSeverity(item.severity)}`}>
                <p className="text-sm font-semibold">{item.title || item.event}</p>
                <p className="mt-1 text-xs opacity-80">{item.message || "New supply chain event recorded."}</p>
                <p className="mt-2 text-[11px] opacity-70">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </p>
              </div>
            )) : (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No live alerts yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationCenter;
