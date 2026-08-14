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

type Precision = "exact" | "approximate" | "none";

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

export function PropertyMap({ address, neighborhood, city }: PropertyMapProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [precision, setPrecision] = useState<Precision>("none");
  const [ready, setReady] = useState(false);

  const fullAddress = [address, neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const neighborhoodQuery = [neighborhood, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const cityQuery = [city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setCoords(null);
    setPrecision("none");

    async function run() {
      // Vamos de más preciso a más general: dirección exacta → barrio/ciudad →
      // solo ciudad. Casi siempre alguno de los tres encuentra algo, así que
      // el mapa se ve prácticamente siempre, aunque sea con menos precisión.
      const exact = await geocodeAddress(fullAddress);
      if (cancelled) return;
      if (exact) {
        setCoords(exact);
        setPrecision("exact");
        setReady(true);
        return;
      }

      const approxNeighborhood = await geocodeAddress(neighborhoodQuery);
      if (cancelled) return;
      if (approxNeighborhood) {
        setCoords(approxNeighborhood);
        setPrecision("approximate");
        setReady(true);
        return;
      }

      const approxCity = await geocodeAddress(cityQuery);
      if (cancelled) return;
      if (approxCity) {
        setCoords(approxCity);
        setPrecision("approximate");
        setReady(true);
        return;
      }

      setPrecision("none");
      setReady(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [fullAddress, neighborhoodQuery, cityQuery]);

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

  if (coords && precision === "approximate") {
    // No tenemos la dirección exacta (o preferimos no mostrarla): igual
    // mostramos un mapa real, más alejado, con un círculo indicando la zona
    // aproximada en vez de un pin puntual.
    return (
      <div className="aspect-video rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[coords.lat, coords.lon]}
            radius={900}
            pathOptions={{ color: "#2D3191", fillColor: "#2D3191", fillOpacity: 0.15 }}
          >
            <Popup>
              Zona aproximada: {neighborhood}
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
