const sanitizeString = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/[<>]/g, "").trim().slice(0, maxLength);
};

const parsePositiveInt = (value, fallback, max = 100) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const parseLocationPayload = (location) => {
  if (!location || typeof location !== "object") {
    return undefined;
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return undefined;
  }

  return JSON.stringify({
    lat,
    lng,
    accuracy: Number.isFinite(Number(location.accuracy))
      ? Number(location.accuracy)
      : undefined,
    source: sanitizeString(location.source || "browser", 40),
  });
};

const parseStoredLocation = (location) => {
  if (!location) return null;

  try {
    const parsed = JSON.parse(location);
    if (
      Number.isFinite(Number(parsed.lat)) &&
      Number.isFinite(Number(parsed.lng))
    ) {
      return {
        lat: Number(parsed.lat),
        lng: Number(parsed.lng),
        accuracy: parsed.accuracy,
        source: parsed.source || "browser",
      };
    }
  } catch {
    return null;
  }

  return null;
};

module.exports = {
  sanitizeString,
  parsePositiveInt,
  parseLocationPayload,
  parseStoredLocation,
};
