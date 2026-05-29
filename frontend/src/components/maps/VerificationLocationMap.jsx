import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

function VerificationLocationMap({ locations = [], height = 300 }) {
  const points = locations.filter((item) =>
    Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng))
  );

  if (!points.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
        style={{ minHeight: height }}
      >
        No scan locations available
      </div>
    );
  }

  const center = [Number(points[0].lat), Number(points[0].lng)];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200" style={{ height }}>
      <MapContainer center={center} zoom={points.length > 1 ? 4 : 12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point, index) => (
          <CircleMarker
            key={point.id || `${point.lat}-${point.lng}-${index}`}
            center={[Number(point.lat), Number(point.lng)]}
            radius={point.severity === "HIGH" || point.severity === "CRITICAL" ? 10 : 7}
            pathOptions={{
              color: point.severity === "HIGH" || point.severity === "CRITICAL" ? "#ef4444" : "#2563eb",
              fillColor: point.severity === "HIGH" || point.severity === "CRITICAL" ? "#fecaca" : "#bfdbfe",
              fillOpacity: 0.75,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{point.label || "Verification scan"}</p>
                <p>{point.timestamp ? new Date(point.timestamp).toLocaleString() : "Location captured"}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default VerificationLocationMap;
