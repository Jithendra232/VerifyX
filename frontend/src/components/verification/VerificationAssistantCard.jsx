function VerificationAssistantCard({ assistant, counterfeitAssessment, investigator }) {
  if (!assistant) return null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Verification Assistant</p>
        <p className="mt-1 text-xs text-slate-500">{assistant.disclaimer}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Product</p>
          <p className="mt-1 font-semibold text-slate-900">{assistant.productSummary?.name}</p>
          <p className="text-sm text-slate-600">Batch {assistant.productSummary?.batchNumber}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Ownership</p>
          <p className="mt-1 text-sm text-slate-700">
            Current role: {assistant.ownershipSummary?.currentOwnerRole}
          </p>
          <p className="text-sm text-slate-700">
            Completed transfers: {assistant.ownershipSummary?.transferCount}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
        <p className="text-xs font-semibold uppercase text-emerald-800">Authenticity</p>
        <p className="mt-1 font-semibold text-slate-950">
          {counterfeitAssessment?.status || assistant.authenticityExplanation?.label}
        </p>
        <p className="text-sm text-slate-700">
          Risk {assistant.authenticityExplanation?.riskScore} ({assistant.authenticityExplanation?.riskLevel})
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {(assistant.authenticityExplanation?.reasons || []).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      {investigator?.summary ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-blue-800">Investigator note</p>
          <p className="mt-1">{investigator.summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export default VerificationAssistantCard;
