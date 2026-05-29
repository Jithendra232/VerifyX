const STORAGE_KEY = "scv_verification_history";

export const getVerificationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveVerificationRecord = (record) => {
  const current = getVerificationHistory();
  const next = [
    {
      id: `${Date.now()}-${record.productId || "unknown"}`,
      timestamp: new Date().toISOString(),
      ...record,
    },
    ...current,
  ].slice(0, 100);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
