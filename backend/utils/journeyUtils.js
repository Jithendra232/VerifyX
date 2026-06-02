const { parseStoredLocation } = require("./validationUtils");
const { formatLocationLabel } = require("./geoUtils");

const ROLE_ORDER = ["manufacturer", "distributor", "retailer", "customer"];

const STAGE_BY_TYPE = {
  CREATED: "Manufactured",
  MANUFACTURER_TO_DISTRIBUTOR: "Transferred",
  DISTRIBUTOR_TO_RETAILER: "Transferred",
  RETAILER_TO_CUSTOMER: "Transferred",
  DISTRIBUTOR_TO_DISTRIBUTOR: "Transferred",
  VERIFIED: "Verified",
};

const stageForTransfer = (transfer) => {
  if (transfer.status === "PENDING") return "Transferred";
  if (transfer.status === "COMPLETED" || transfer.status === "ACCEPTED") {
    return "Accepted";
  }
  return STAGE_BY_TYPE[transfer.transferType] || "Transferred";
};

const buildRouteChain = (product, transfers = []) => {
  const nodes = [];

  if (product?.createdBy) {
    nodes.push({
      role: product.createdBy.role || "manufacturer",
      user: product.createdBy,
      stage: "Manufacturer",
    });
  }

  const completed = transfers
    .filter((transfer) => transfer.status === "COMPLETED")
    .sort((a, b) => new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt));

  completed.forEach((transfer) => {
    if (transfer.toUser) {
      nodes.push({
        role: transfer.toUser.role,
        user: transfer.toUser,
        stage: transfer.toUser.role
          ? transfer.toUser.role.charAt(0).toUpperCase() + transfer.toUser.role.slice(1)
          : "Custody",
        transferType: transfer.transferType,
        completedAt: transfer.completedAt || transfer.createdAt,
      });
    }
  });

  const uniqueByRole = [];
  const seen = new Set();

  nodes.forEach((node) => {
    const key = `${node.role}-${node.user?._id || node.user?.email || node.stage}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniqueByRole.push(node);
  });

  return uniqueByRole;
};

const buildMapPoints = ({ transfers = [], verifications = [] }) => {
  const points = [];

  transfers.forEach((transfer) => {
    const locationData = parseStoredLocation(transfer.location);
    if (!locationData) return;

    points.push({
      id: `transfer-${transfer._id}`,
      type: "transfer",
      lat: locationData.lat,
      lng: locationData.lng,
      label: formatLocationLabel(locationData) || "Transfer location",
      role: transfer.toUser?.role || transfer.fromUser?.role,
      timestamp: transfer.completedAt || transfer.createdAt,
      severity: transfer.status === "COMPLETED" ? "LOW" : "MEDIUM",
    });
  });

  verifications.forEach((log) => {
    const locationData = log.locationData || parseStoredLocation(log.location);
    if (!locationData) return;

    points.push({
      id: `verify-${log._id}`,
      type: "verification",
      lat: locationData.lat,
      lng: locationData.lng,
      label: formatLocationLabel(locationData) || "Verification scan",
      timestamp: log.createdAt,
      severity: log.result === "AUTHENTIC" ? "LOW" : "HIGH",
    });
  });

  return points.sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
};

const enrichTimeline = (product, transfers, verifications) => {
  const items = [
    {
      id: `created-${product._id}`,
      type: "CREATED",
      stage: "Manufactured",
      title: "Product manufactured",
      actor: product.createdBy,
      owner: product.createdBy,
      createdAt: product.createdAt,
      status: product.status,
    },
    ...transfers.map((transfer) => ({
      id: transfer._id,
      type: transfer.transferType,
      stage: stageForTransfer(transfer),
      title:
        transfer.status === "COMPLETED"
          ? "Transfer accepted"
          : "Ownership transfer initiated",
      actor: transfer.fromUser,
      owner: transfer.toUser,
      fromUser: transfer.fromUser,
      toUser: transfer.toUser,
      createdAt: transfer.createdAt,
      status: transfer.status,
      statusHistory: transfer.statusHistory,
      notes: transfer.notes,
      locationData: parseStoredLocation(transfer.location),
    })),
  ];

  if (product.status === "SOLD") {
    items.push({
      id: `sold-${product._id}`,
      type: "SOLD",
      stage: "Sold",
      title: "Product sold to customer",
      owner: product.currentOwner,
      createdAt: product.updatedAt || product.createdAt,
      status: product.status,
    });
  }

  const latestVerification = verifications[0];
  if (latestVerification) {
    items.push({
      id: `verified-${latestVerification._id}`,
      type: "VERIFIED",
      stage: "Verified",
      title: "Product verified",
      actor: latestVerification.scannedBy,
      createdAt: latestVerification.createdAt,
      status: latestVerification.result,
      locationData:
        latestVerification.locationData ||
        parseStoredLocation(latestVerification.location),
    });
  }

  return items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const hasRoleGap = (routeChain) => {
  const roles = routeChain.map((node) => node.role).filter(Boolean);
  const roleIndexes = roles
    .map((role) => ROLE_ORDER.indexOf(role))
    .filter((index) => index >= 0);

  for (let i = 1; i < roleIndexes.length; i += 1) {
    if (roleIndexes[i] < roleIndexes[i - 1]) {
      return true;
    }
  }

  return false;
};

module.exports = {
  buildRouteChain,
  buildMapPoints,
  enrichTimeline,
  hasRoleGap,
  STAGE_BY_TYPE,
};
