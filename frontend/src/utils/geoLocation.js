export function getBrowserLocation() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "browser",
        });
      },
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 2500 }
    );
  });
}
