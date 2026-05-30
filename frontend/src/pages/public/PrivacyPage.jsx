import PublicPage from "../../components/common/PublicPage";

const sections = [
  ["Data collected", "The project stores account identity, product records, transfer events, verification logs, and optional browser-provided scan location data."],
  ["Data use", "Data is used to support authentication, role-based dashboards, product verification, fraud review, and supply chain visibility."],
  ["Access control", "Dashboard access is protected by the existing authentication and role checks configured in the application."],
  ["Retention", "Operational records remain available for audit and verification history unless removed by an authorized administrator."],
];

function PrivacyPage() {
  return (
    <PublicPage
      eyebrow="Privacy"
      title="Privacy policy"
      subtitle="This policy summarizes how SupplyVerify handles project and verification data."
    >
      <div className="space-y-3">
        {sections.map(([title, body]) => (
          <section key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </section>
        ))}
      </div>
    </PublicPage>
  );
}

export default PrivacyPage;
