import { Link } from "react-router-dom";
import PublicPage from "../../components/common/PublicPage";

function GlobalErrorPage() {
  return (
    <PublicPage
      eyebrow="Error"
      title="Something went wrong"
      subtitle="The application could not render this view. Your authentication session was not changed."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Reload
        </button>
        <Link
          to="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Return Home
        </Link>
      </div>
    </PublicPage>
  );
}

export default GlobalErrorPage;
