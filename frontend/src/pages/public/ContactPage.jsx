import PublicPage from "../../components/common/PublicPage";

function ContactPage() {
  return (
    <PublicPage
      eyebrow="Support"
      title="Contact and support"
      subtitle="For account access, verification questions, or operational support, use the channels below."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">General support</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">support@supplyverify.local</p>
          <p className="mt-1 text-sm text-slate-500">Monday to Friday, 9:00 AM to 6:00 PM</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Security review</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">security@supplyverify.local</p>
          <p className="mt-1 text-sm text-slate-500">For suspicious product or scan escalations.</p>
        </section>
      </div>
    </PublicPage>
  );
}

export default ContactPage;
