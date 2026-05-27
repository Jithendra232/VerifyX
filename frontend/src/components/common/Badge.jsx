const variantStyles = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  neutral: "badge-neutral",
};

const riskVariantStyles = {
  LOW: "badge-risk-low",
  MEDIUM: "badge-risk-medium",
  HIGH: "badge-risk-high",
  CRITICAL: "badge-risk-critical",
};

function Badge({ children, variant = "neutral", isRisk = false, className = "" }) {
  const styles = isRisk ? riskVariantStyles[children] || riskVariantStyles.LOW : variantStyles[variant];

  return (
    <span className={`badge ${styles} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
