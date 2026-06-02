const EARTH_RADIUS_KM = 6371;

const haversineKm = (from, to) => {
  const lat1 = Number(from?.lat);
  const lng1 = Number(from?.lng);
  const lat2 = Number(to?.lat);
  const lng2 = Number(to?.lng);

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatLocationLabel = (location) => {
  if (!location) return "";
  const parts = [location.city, location.state, location.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
    return `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
  }
  return "";
};

module.exports = {
  haversineKm,
  formatLocationLabel,
};
