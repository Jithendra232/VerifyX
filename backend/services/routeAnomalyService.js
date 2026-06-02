const { parseStoredLocation } = require("../utils/validationUtils");
const { haversineKm } = require("../utils/geoUtils");
const { hasRoleGap } = require("../utils/journeyUtils");

const MAX_SPEED_KMH = 900;
const MIN_JUMP_KM = 250;
const MIN_JUMP_HOURS = 3;

const collectGeoEvents = (transfers = [], verifications = []) => {
  const events = [];

  transfers.forEach((transfer) => {
    const location = parseStoredLocation(transfer.location);
    if (!location) return;
    events.push({
      at: new Date(transfer.completedAt || transfer.createdAt || 0),
      location,
      kind: "transfer",
      id: transfer._id,
    });
  });

  verifications.forEach((log) => {
    const location = parseStoredLocation(log.location);
    if (!location) return;
    events.push({
      at: new Date(log.createdAt || 0),
      location,
      kind: "verification",
      id: log._id,
    });
  });

  return events
    .filter((event) => Number.isFinite(event.at?.getTime?.()))
    .sort((a, b) => a.at - b.at);
};

const analyzeRouteAnomalies = ({ transfers = [], verifications = [], routeChain = [] }) => {
  const reasons = [];
  let score = 0;
  const events = collectGeoEvents(transfers, verifications);

  if (hasRoleGap(routeChain)) {
    score += 20;
    reasons.push("Supply chain route reversed or skipped expected role order");
  }

  const labels = events.map((event) =>
    [event.location.city, event.location.state, event.location.country]
      .filter(Boolean)
      .join("|")
      .toLowerCase()
  );

  for (let i = 0; i < labels.length - 2; i += 1) {
    if (labels[i] && labels[i + 2] && labels[i] === labels[i + 2] && labels[i] !== labels[i + 1]) {
      score += 15;
      reasons.push("Route loop detected between custody locations");
      break;
    }
  }

  for (let i = 1; i < events.length; i += 1) {
    const prev = events[i - 1];
    const current = events[i];
    const distanceKm = haversineKm(prev.location, current.location);
    const hours =
      Math.max(current.at.getTime() - prev.at.getTime(), 1) / (1000 * 60 * 60);

    if (distanceKm === null) continue;

    if (distanceKm >= MIN_JUMP_KM && hours <= MIN_JUMP_HOURS) {
      score += 25;
      reasons.push(
        `Unexpected location jump of ${Math.round(distanceKm)} km within ${hours.toFixed(1)} hours`
      );
    }

    const speed = distanceKm / hours;
    if (speed > MAX_SPEED_KMH) {
      score += 20;
      reasons.push("Impossible travel timing between recorded geo events");
      break;
    }
  }

  return {
    score: Math.min(score, 40),
    reasons: [...new Set(reasons)],
    eventCount: events.length,
  };
};

module.exports = {
  analyzeRouteAnomalies,
  collectGeoEvents,
};
