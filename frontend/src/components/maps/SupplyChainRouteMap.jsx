import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";

const ROLE_COLORS = {
  manufacturer: "#2563eb",
  distributor: "#7c3aed",
  retailer: "#059669",
  customer: "#ea580c",
};

function SupplyChainRouteMap({ mapPoints = [], routeChain = [], height = 320 }) {
  const points = (mapPoints.length ? mapPoints : [])
    .filter((item) => Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng)));

  if (!points.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
        style={{ minHeight: height }}
      >
        No route locations recorded yet
      </div>
    );
  }

  const center = [Number(points[0].lat), Number(points[0].lng)];
  const polyline = points.map((point) => [Number(point.lat), Number(point.lng)]);

  return (
    <div className="space-y-3">
      {routeChain.length ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {routeChain.map((node, index) => (
            <span key={`${node.stage}-${index}`} className="inline-flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                {node.stage || node.role}
              </span>
              {index < routeChain.length - 1 ? <span className="text-slate-400">↓</span> : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200" style={{ height }}>
        <MapContainer center={center} zoom={points.length > 1 ? 5 : 11} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polyline.length > 1 ? (
            <Polyline positions={polyline} pathOptions={{ color: "#2563eb", weight: 3, opacity: 0.7 }} />
          ) : null}
          {points.map((point, index) => (
            <CircleMarker
              key={point.id || `${point.lat}-${point.lng}-${index}`}
              center={[Number(point.lat), Number(point.lng)]}
              radius={8}
              pathOptions={{
                color: ROLE_COLORS[point.role] || "#334155",
                fillColor: ROLE_COLORS[point.role] || "#94a3b8",
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{point.label || point.type}</p>
                  <p className="capitalize text-slate-600">{point.type || "event"}</p>
                  <p>{point.timestamp ? new Date(point.timestamp).toLocaleString() : ""}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default SupplyChainRouteMap;
