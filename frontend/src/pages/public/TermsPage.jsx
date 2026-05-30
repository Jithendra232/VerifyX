import PublicPage from "../../components/common/PublicPage";

const sections = [
  ["Authorized use", "Use the platform only for legitimate product verification, custody tracking, and account operations."],
  ["Account responsibility", "Users are responsible for maintaining secure access to their own accounts and reporting suspicious activity."],
  ["Verification results", "Verification results reflect available registry data and risk signals at the time of the request."],
  ["Changes", "Terms may be updated as the project evolves, with continued use indicating acceptance of the latest version."],
];

function TermsPage() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Terms and conditions"
      subtitle="These terms define acceptable use for the SupplyVerify project."
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

export default TermsPage;
