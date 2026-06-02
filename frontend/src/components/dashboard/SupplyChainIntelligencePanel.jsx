import { StatusBadge } from "./DashboardUI";

function toneForRisk(level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized.includes("high")) return "danger";
  if (normalized.includes("medium")) return "warning";
  return "success";
}

function SupplyChainIntelligencePanel({ intelligence }) {
  if (!intelligence) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        Intelligence insights will appear after transfer and verification activity is recorded.
      </p>
    );
  }

  const { riskScore, riskLevel, counterfeit, investigator, fraudRules = [] } = intelligence;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Score</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{riskScore ?? 0}</p>
          <StatusBadge tone={toneForRisk(riskLevel)}>{riskLevel || "Low"}</StatusBadge>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Counterfeit Assessment</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{counterfeit?.status || "Authentic"}</p>
          <p className="mt-1 text-sm text-slate-600">{counterfeit?.reasons?.[0]}</p>
        </div>
      </div>

      {investigator?.summary ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">AI Supply Chain Investigator</p>
          <p className="mt-2 text-sm text-slate-800">{investigator.summary}</p>
          {investigator.findings?.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {investigator.findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {fraudRules.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Triggered Fraud Rules</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {fraudRules.map((rule) => (
              <span key={rule.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-900">
                {rule.id.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SupplyChainIntelligencePanel;
