import { useEffect, useState } from "react";
import {
  DashboardPage,
  Panel,
  StatusBadge,
} from "../../components/dashboard/DashboardUI";

const STORAGE_KEY = "supplyverify.dashboard.settings";

function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <DashboardPage
      title="Settings"
      subtitle="Personal dashboard preferences stored in this browser."
    >
      <Panel title="Preferences" subtitle="Local display and notification choices.">
        <div className="space-y-3">
          {[
            ["compactTables", "Compact tables"],
            ["showLiveAlerts", "Show live alerts"],
            ["rememberFilters", "Remember filters"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <span className="font-medium text-slate-800">{label}</span>
              <span className="flex items-center gap-3">
                <StatusBadge tone={settings[key] ? "success" : "neutral"}>
                  {settings[key] ? "On" : "Off"}
                </StatusBadge>
                <input
                  type="checkbox"
                  checked={Boolean(settings[key])}
                  onChange={() => toggle(key)}
                  className="h-4 w-4"
                />
              </span>
            </label>
          ))}
        </div>
      </Panel>
    </DashboardPage>
  );
}

export default SettingsPage;
