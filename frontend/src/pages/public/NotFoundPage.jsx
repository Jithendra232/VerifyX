import { Link } from "react-router-dom";
import PublicPage from "../../components/common/PublicPage";

function NotFoundPage() {
  return (
    <PublicPage
      eyebrow="404"
      title="Page not found"
      subtitle="The page you requested does not exist or is no longer available."
    >
      <Link
        to="/"
        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Return Home
      </Link>
    </PublicPage>
  );
}

export default NotFoundPage;
