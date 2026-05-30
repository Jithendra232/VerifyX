import { NavLink } from "react-router-dom";
import { normalizeRole } from "../../utils/roleUtils";
import Logo from "./Logo";

function Sidebar({ role }) {
  const normalizedRole = normalizeRole(role) || "customer";
  const items = [
    { to: `/dashboard/${normalizedRole}`, label: "Dashboard" },
    ...(normalizedRole === "manufacturer"
      ? [{ to: "/manufacturer/add-product", label: "Add Product" }]
      : []),
    { to: "/dashboard/history", label: "Product History" },
    { to: "/dashboard/verification-history", label: "Verification History" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/settings", label: "Settings" },
    ...(normalizedRole === "admin"
      ? [{ to: "/dashboard/audit-logs", label: "Audit Logs" }]
      : []),
    { to: "/verify", label: "Verify Product" },
  ];

  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
      <div className="mb-4">
        <Logo />
      </div>
      <div className="rounded-xl bg-slate-900 px-3 py-4 text-white">
        <p className="text-xs uppercase tracking-wide text-slate-300">Role</p>
        <p className="mt-1 text-sm font-semibold capitalize">{normalizedRole}</p>
      </div>
      <nav className="mt-4 flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
