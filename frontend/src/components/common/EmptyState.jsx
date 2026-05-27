function EmptyState({ title, description, action, icon = "📄" }) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-600">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
