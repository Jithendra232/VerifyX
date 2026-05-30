import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const META = {
  "/": ["SupplyVerify", "Anti-counterfeit supply chain verification platform."],
  "/about": ["About | SupplyVerify", "Learn about SupplyVerify product verification and custody tracking."],
  "/contact": ["Contact | SupplyVerify", "Contact SupplyVerify support for product verification help."],
  "/verify": ["Verify Product | SupplyVerify", "Verify product authenticity with QR or product ID checks."],
  "/terms": ["Terms | SupplyVerify", "SupplyVerify terms and conditions."],
  "/privacy": ["Privacy | SupplyVerify", "SupplyVerify privacy policy."],
  "/maintenance": ["Maintenance | SupplyVerify", "SupplyVerify maintenance status."],
  "/dashboard": ["Dashboard | SupplyVerify", "SupplyVerify role dashboard."],
  "/dashboard/profile": ["Profile | SupplyVerify", "User profile details."],
  "/dashboard/settings": ["Settings | SupplyVerify", "User settings."],
};

function setMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const key = Object.keys(META)
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0];
    const [title, description] = META[key] || ["Page Not Found | SupplyVerify", "The requested SupplyVerify page was not found."];

    document.title = title;
    setMetaDescription(description);
  }, [pathname]);

  return null;
}

export default PageMeta;
