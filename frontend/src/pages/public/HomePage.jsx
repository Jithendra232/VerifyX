import { Link } from "react-router-dom";
import { useAuthSync } from "../../context/AuthSyncContext";
import { getDashboardPathForRole } from "../../utils/rolePaths";

const features = [
  ["QR verification", "Scan QR labels or enter product IDs to validate authenticity in real time."],
  ["Counterfeit detection", "Flag unknown, malformed, or suspicious product records before they move downstream."],
  ["Supply chain tracking", "Follow custody changes from manufacturer to distributor, retailer, and customer."],
  ["Role-based management", "Give each participant a focused workflow without mixing operational access."],
  ["Secure authentication", "Clerk-backed sign-in and protected dashboards keep sensitive actions guarded."],
  ["Fraud visibility", "Risk cards and activity tables help teams investigate abnormal product behavior."],
];

const workflow = [
  ["Admin", "Monitor users, product volume, transfers, and risk signals."],
  ["Manufacturer", "Register products and track outbound transfer history."],
  ["Distributor", "Review inventory custody and downstream movement."],
  ["Retailer", "Verify stock and manage customer handoff records."],
  ["Customer", "Check owned products and suspicious verification history."],
];

function HomePage() {
  const { hasActiveSession, isSessionReady, mongoUser } = useAuthSync();
  const dashboardPath =
    hasActiveSession && isSessionReady ? getDashboardPathForRole(mongoUser?.role) : null;
  const signedIn = Boolean(dashboardPath && dashboardPath !== "/");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight text-slate-950">
            SupplyVerify
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <Link to="/verify">Verify</Link>
          </div>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                to={dashboardPath}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go To Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="overflow-hidden border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Anti-counterfeit supply chain platform
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Verify every product before trust moves downstream.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Secure QR verification, custody tracking, fraud detection, and role-based dashboards for modern product supply chains.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/verify"
                  className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Verify Product
                </Link>
                <Link
                  to={signedIn ? dashboardPath : "/login"}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {signedIn ? "Open Dashboard" : "Access Platform"}
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-300">QR Verification Showcase</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Authentic
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-[160px_1fr]">
                  <div className="grid aspect-square grid-cols-5 gap-1 rounded-xl bg-white p-3">
                    {Array.from({ length: 25 }).map((_, index) => (
                      <span
                        key={index}
                        className={`rounded-sm ${
                          [0, 1, 2, 5, 10, 12, 14, 18, 20, 21, 22, 24].includes(index)
                            ? "bg-slate-950"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Product</p>
                      <p className="mt-1 font-semibold text-white">Batch SCV-2049-A</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Chain Status</p>
                      <p className="mt-1 font-semibold text-emerald-200">Verified custody trail</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Signal</p>
                      <p className="mt-1 font-semibold text-blue-200">No fraud indicators detected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["5", "role dashboards"],
              ["QR", "instant checks"],
              ["RBAC", "protected access"],
              ["24/7", "public verification"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Platform Features</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Built for trustworthy product movement</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(([title, description]) => (
                <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Role-Based Workflow</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Clear actions for every participant</h2>
              <p className="mt-4 text-slate-600">
                Each role gets focused operational visibility while public verification remains available for quick authenticity checks.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map(([role, detail]) => (
                <div key={role} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="font-semibold text-slate-950">{role}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 text-white md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Ready to validate a product?</h2>
              <p className="mt-2 text-slate-300">Use QR scanning or manual verification without changing the secure dashboard workflow.</p>
            </div>
            <Link
              to="/verify"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Start Verification
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>SupplyVerify anti-counterfeit verification platform</span>
          <span>Secure QR checks, RBAC dashboards, and product custody tracking</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
