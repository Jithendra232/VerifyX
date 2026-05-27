function FeedbackBanner({ type = "error", title, message, onDismiss }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-green-200 bg-green-50 text-green-800",
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.error}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {title ? <p className="font-semibold">{title}</p> : null}
          {message ? <p className={title ? "mt-1" : ""}>{message}</p> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-medium underline"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default FeedbackBanner;
