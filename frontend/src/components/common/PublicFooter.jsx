import { Link } from "react-router-dom";
import Logo from "./Logo";

function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-600 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-md leading-6">
            Secure product verification, custody tracking, and risk visibility for supply chain participants.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-950">Platform</p>
          <Link className="block hover:text-slate-950" to="/about">About</Link>
          <Link className="block hover:text-slate-950" to="/contact">Contact</Link>
          <Link className="block hover:text-slate-950" to="/verify">Verify</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-950">Legal</p>
          <Link className="block hover:text-slate-950" to="/terms">Terms</Link>
          <Link className="block hover:text-slate-950" to="/privacy">Privacy</Link>
          <Link className="block hover:text-slate-950" to="/maintenance">Status</Link>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
