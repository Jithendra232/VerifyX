import { useState } from "react";
import { Panel } from "./DashboardUI";
import { resetDemoSupplyChain, seedDemoSupplyChain } from "../../services/demoService";

function DemoModePanel({ getToken }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const run = async (action) => {
    if (!getToken || loading) return;
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response =
        action === "seed" ? await seedDemoSupplyChain(getToken) : await resetDemoSupplyChain(getToken);
      setMessage(response.message || "Demo operation completed.");
    } catch (err) {
      setError(err.message || "Demo operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel
      title="Demo Supply Chain Mode"
      subtitle="Seed isolated demo manufacturers, distributors, retailers, customers, products, transfers, and verification history. Requires DEMO_MODE_ENABLED=true on the API."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => run("seed")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Working..." : "Load Demo Data"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => run("reset")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Reset Demo Data
        </button>
      </div>
      {message ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </Panel>
  );
}

export default DemoModePanel;
