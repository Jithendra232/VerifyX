export function collectDashboardProducts(role, data) {
  const sources = [
    ...(data?.recentlyCreatedProducts || []),
    ...(data?.productsCurrentlyOwned || []),
    ...(data?.ownedProducts || []),
  ];

  return sources.map((item, index) => ({
    id: item._id || item.productId || `${role}-product-${index}`,
    productName: item.productName || item.product?.productName || "Unknown product",
    batchNumber: item.batchNumber || item.product?.batchNumber || "-",
    status: item.verificationStatus || item.status || "tracked",
    role,
  }));
}

export function collectDashboardTransfers(role, data) {
  const sources = [
    ...(data?.recentOutgoingTransfers || []),
    ...(data?.customerTransfers || []),
    ...(data?.recentActivities || []),
  ];

  return sources.map((item, index) => ({
    id: item._id || `${role}-transfer-${index}`,
    productName: item.product?.productName || item.productName || item.label || "Supply chain event",
    from: item.fromUser?.name || item.from || role,
    to: item.toUser?.name || item.recipient || item.to || "Next owner",
    type: item.transferType || item.type || "activity",
    status: item.status || "recorded",
  }));
}
