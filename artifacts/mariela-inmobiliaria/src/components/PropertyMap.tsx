import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  address: string;
  neighborhood: string;
  city: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

type Precision = "exact" | "street" | "area" | "none";

// Ícono de pin personalizado (color primario del sitio) hecho con SVG inline,
// evita el clásico problema de Leaflet con los íconos por defecto en Vite.
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

// Cache en memoria para no repetir búsquedas al navegar entre propiedades.
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

// Saca los nombres de calle de una dirección de esquina/intersección, por
// ejemplo "Esquina de Garrigó y Villa Seguí", "Solá & Villaguay" o
// "Belgrano esq. San Martín". Devuelve una o dos calles (sin altura), en
// orden, para poder ubicar el mapa sobre la calle real en vez del barrio.
function extractStreetNames(address: string): string[] {
  const withoutPrefix = address.replace(/^\s*esq(?:uina)?\.?\s*(?:de\s+)?/i, "").trim();
  const segments = withoutPrefix
    .split(/\s*(?:&|\/|\by\b| esq\.?| esquina\b)\s*/i)
    .map((s) => s.replace(/\d+.*$/, "").trim())
    .filter(Boolean);
  return segments.length > 0 ? segments : [withoutPrefix];
}

export function PropertyMap({ address, neighborhood, city }: PropertyMapProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [precision, setPrecision] = useState<Precision>("none");
  const [matchedStreet, setMatchedStreet] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const fullAddress = [address, neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const addressOnlyQuery = [address, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const streetNames = extractStreetNames(address);
  const streetQueries = streetNames.map((name) => [name, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", "));
  const streetNamesKey = streetQueries.join("|");
  const neighborhoodQuery = [neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const cityQuery = [city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setCoords(null);
    setPrecision("none");
    setMatchedStreet(null);

    async function run() {
      // De más preciso a más general:
      // 1) dirección completa   2) dirección sin el barrio
      // 3) cada calle de la dirección (por si es una esquina)
      // 4) barrio   5) solo ciudad
      const attempts: Array<{ query: string; precision: Precision; street?: string }> = [
        { query: fullAddress, precision: "exact" },
        { query: addressOnlyQuery, precision: "exact" },
        ...streetQueries.map((query, i) => ({ query, precision: "street" as Precision, street: streetNames[i] })),
        { query: neighborhoodQuery, precision: "area" },
        { query: cityQuery, precision: "area" },
      ];

      for (const attempt of attempts) {
        const result = await geocodeAddress(attempt.query);
        if (cancelled) return;
        if (result) {
          setCoords(result);
          setPrecision(attempt.precision);
          setMatchedStreet(attempt.street ?? null);
          setReady(true);
          return;
        }
      }

      setPrecision("none");
      setReady(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullAddress, addressOnlyQuery, streetNamesKey, neighborhoodQuery, cityQuery]);

  if (coords && precision === "exact") {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={16}
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

  if (coords && (precision === "street" || precision === "area")) {
    // No hay match exacto de la altura, pero sí de la calle (o al menos del
    // barrio/ciudad): mostramos un mapa real centrado ahí, con un círculo en
    // vez de un pin puntual para dejar claro que es aproximado. El círculo es
    // más chico cuando estamos ubicados sobre la calle real, y más grande
    // cuando solo pudimos ubicar el barrio o la ciudad.
    const isStreet = precision === "street";
    return (
      <div className="aspect-video rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={isStreet ? 15 : 13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[coords.lat, coords.lon]}
            radius={isStreet ? 250 : 900}
            pathOptions={{ color: "#2D3191", fillColor: "#2D3191", fillOpacity: 0.15 }}
          >
            <Popup>
              Zona aproximada{isStreet && matchedStreet ? ` — ${matchedStreet}` : ""}
              {neighborhood ? `, ${neighborhood}` : ""}
              {city ? `, ${city}` : ""}
            </Popup>
          </Circle>
        </MapContainer>
      </div>
    );
  }

  // Solo llegamos acá si ni siquiera la ciudad se pudo ubicar (muy raro) o
  // mientras se está buscando por primera vez.
  return (
    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center bg-background/90 p-4 rounded-xl backdrop-blur-sm border shadow-sm text-center">
        <MapPin className="w-8 h-8 text-primary mb-2" />
        <p className="font-semibold">{neighborhood}</p>
        <p className="text-sm text-muted-foreground">{city}</p>
        {!ready && <p className="text-xs text-muted-foreground mt-2">Cargando mapa…</p>}
      </div>
    </div>
  );
}
