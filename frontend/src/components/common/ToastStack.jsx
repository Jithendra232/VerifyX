import FeedbackBanner from "./FeedbackBanner";

function ToastStack({ items, onDismiss }) {
  if (!items.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))] space-y-3">
      {items.map((toast) => (
        <FeedbackBanner
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastStack;
