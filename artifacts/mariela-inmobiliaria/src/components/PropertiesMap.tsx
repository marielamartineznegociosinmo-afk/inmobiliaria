import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "wouter";
import type { Property } from "@workspace/api-client-react";
import { formatPrice } from "@/components/PropertyCard";
import { propertyPath } from "@/lib/property-url";
import { optimizedImage } from "@/lib/images";
import { typeLabel } from "@/lib/property-labels";

// Mapa con todas las propiedades. Cada pin está sobre la calle de la
// propiedad, pero no en la casa exacta (el servidor ubica la mitad de la
// cuadra o solo la calle), para cuidar al propietario.

const PARANA_CENTER: [number, number] = [-31.7413, -60.5115];
const PRIMARY = "#2D3191";
const ACCENT = "#18b0e7";

// Pin con el color de la operación (SVG propio: evita el problema de los
// íconos por defecto de Leaflet con Vite).
function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="30" height="40" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.35))"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="6.5" fill="#fff"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}
const SALE_PIN = pinIcon(PRIMARY);
const RENT_PIN = pinIcon(ACCENT);

type Located = Property & { mapLatitude: number; mapLongitude: number };

function isLocated(p: Property): p is Located {
  return typeof p.mapLatitude === "number" && typeof p.mapLongitude === "number";
}

// Distancia aproximada en km entre dos puntos.
function distanceKm(a: [number, number], b: [number, number]) {
  return L.latLng(a).distanceTo(L.latLng(b)) / 1000;
}

// Ajusta el zoom para que entren las propiedades de Paraná y alrededores.
// Las que están lejos (campos, otras localidades) siguen en el mapa, pero no
// achican todo: se ven al alejar el zoom.
function FitToProperties({ points: allPoints }: { points: Array<[number, number]> }) {
  const map = useMap();
  const nearby = allPoints.filter((p) => distanceKm(p, PARANA_CENTER) <= 15);
  const points = nearby.length > 0 ? nearby : allPoints;
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 0) {
      map.setView(PARANA_CENTER, 12);
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 14 });
      // Nunca más lejos que la vista de la ciudad entera.
      if (map.getZoom() < 12) map.setZoom(12);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function PropertiesMap({ properties }: { properties: Property[] }) {
  const located = useMemo(() => properties.filter(isLocated), [properties]);
  const points = useMemo(() => located.map((p) => [p.mapLatitude, p.mapLongitude] as [number, number]), [located]);
  const missing = properties.length - located.length;

  return (
    <div className="space-y-3">
      <div className="h-[70vh] min-h-[420px] rounded-2xl overflow-hidden border relative z-0">
        <MapContainer center={PARANA_CENTER} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToProperties points={points} />
          {located.map((p) => {
            const photo = p.coverPhoto || p.photos?.[0];
            return (
              <Marker
                key={p.id}
                position={[p.mapLatitude, p.mapLongitude]}
                icon={p.operation === "venta" ? SALE_PIN : RENT_PIN}
                title={p.title}
              >
                <Popup minWidth={220} maxWidth={240}>
                  <div className="w-[220px] font-sans">
                    {photo && (
                      <img src={optimizedImage(photo, 480)} alt={p.title} className="w-full h-32 object-cover rounded-md mb-2" loading="lazy" />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground !m-0">
                      {typeLabel(p.type)} en {p.operation}
                    </p>
                    <p className="font-bold text-base leading-tight !my-1 text-foreground">{p.title}</p>
                    <p className="text-lg font-bold !m-0" style={{ color: PRIMARY }}>
                      {formatPrice(p.price, p.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground !mt-1 !mb-2">{p.neighborhood}, {p.city} · ubicación aproximada</p>
                    <Link
                      href={propertyPath(p)}
                      className="block text-center rounded-md px-3 py-2 text-sm font-semibold !text-white"
                      style={{ background: PRIMARY }}
                    >
                      Ver propiedad
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: PRIMARY }} /> Venta
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: ACCENT }} /> Alquiler
        </span>
        <span>Las ubicaciones son aproximadas.</span>
        {missing > 0 && <span>{missing} {missing === 1 ? "propiedad todavía no está ubicada" : "propiedades todavía no están ubicadas"} en el mapa.</span>}
      </div>
    </div>
  );
}
