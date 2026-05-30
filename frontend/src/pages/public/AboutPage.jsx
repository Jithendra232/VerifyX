import PublicPage from "../../components/common/PublicPage";

function AboutPage() {
  return (
    <PublicPage
      eyebrow="About the project"
      title="Supply chain verification built around product trust"
      subtitle="SupplyVerify combines QR verification, role-based dashboards, custody tracking, and fraud visibility for product movement from creation through customer handoff."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Verification", "Public QR and product ID checks help users validate records before accepting a product."],
          ["Custody", "Transfer history keeps ownership movement visible across manufacturers, distributors, retailers, and customers."],
          ["Risk", "Fraud signals and dashboard indicators help teams review suspicious verification activity."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}

export default AboutPage;
