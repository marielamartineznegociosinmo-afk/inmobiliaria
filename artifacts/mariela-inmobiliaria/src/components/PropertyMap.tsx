import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ExternalLink } from "lucide-react";

interface PropertyMapProps {
  address: string;
  neighborhood: string;
  city: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

// Custom pin icon (matches site's primary color) built with a plain SVG data URI,
// avoids the classic Leaflet + bundler "missing marker icon" issue.
const pinIcon = L.divIcon({
  className: "",
  html: `
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z" fill="#2D3191"/>
      <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
    </svg>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

// In-memory cache so navigating between properties (or revisiting one) doesn't
// re-hit the geocoding service unnecessarily.
const geocodeCache = new Map<string, Coordinates | null>();

async function geocodeAddress(query: string): Promise<Coordinates | null> {
  if (geocodeCache.has(query)) {
    return geocodeCache.get(query) ?? null;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("geocoding failed");
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    const result = results[0] ? { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) } : null;
    geocodeCache.set(query, result);
    return result;
  } catch {
    geocodeCache.set(query, null);
    return null;
  }
}

export function PropertyMap({ address, neighborhood, city }: PropertyMapProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");

  const fullAddress = [address, neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const approxQuery = [neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setCoords(null);

    async function run() {
      // Try the full street address first; if that fails, fall back to just
      // the neighborhood/city so we can still show an approximate area.
      let result = await geocodeAddress(fullAddress);
      if (!result) {
        result = await geocodeAddress(approxQuery);
      }
      if (cancelled) return;
      if (result) {
        setCoords(result);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [fullAddress, approxQuery]);

  if (status === "found" && coords) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lon]} icon={pinIcon}>
            <Popup>
              {neighborhood}
              {city ? `, ${city}` : ""}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  }

  // Loading state or geocoding failed: keep the existing calm placeholder look,
  // but always offer a working link out to Google Maps so it's never a dead end.
  return (
    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center bg-background/90 p-4 rounded-xl backdrop-blur-sm border shadow-sm text-center">
        <MapPin className="w-8 h-8 text-primary mb-2" />
        <p className="font-semibold">{neighborhood}</p>
        <p className="text-sm text-muted-foreground">{city}</p>
        {status === "not-found" && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver en Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
