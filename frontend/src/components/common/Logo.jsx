import { Link } from "react-router-dom";

function Logo({ to = "/", compact = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 font-semibold text-slate-950">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
        SV
      </span>
      {!compact ? <span>SupplyVerify</span> : null}
    </Link>
  );
}

export default Logo;
