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

  const payload = {
    lat,
    lng,
    accuracy: Number.isFinite(Number(location.accuracy))
      ? Number(location.accuracy)
      : undefined,
    source: sanitizeString(location.source || "browser", 40),
  };

  const city = sanitizeString(location.city, 80);
  const state = sanitizeString(location.state, 80);
  const country = sanitizeString(location.country, 80);

  if (city) payload.city = city;
  if (state) payload.state = state;
  if (country) payload.country = country;

  return JSON.stringify(payload);
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
        city: parsed.city || "",
        state: parsed.state || "",
        country: parsed.country || "",
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
