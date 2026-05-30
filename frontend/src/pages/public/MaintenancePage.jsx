import PublicPage from "../../components/common/PublicPage";

function MaintenancePage() {
  return (
    <PublicPage
      eyebrow="Status"
      title="Maintenance"
      subtitle="The platform is currently available. Planned maintenance notices can be posted here when needed."
    >
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
        <h2 className="font-semibold">Operational</h2>
        <p className="mt-2 text-sm leading-6">Core verification and dashboard workflows are marked available.</p>
      </section>
    </PublicPage>
  );
}

export default MaintenancePage;
