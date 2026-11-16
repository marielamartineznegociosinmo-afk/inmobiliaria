import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2 } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mapita del panel para elegir dónde va el pin de una propiedad.
// Se escribe la calle y se busca, y después se puede arrastrar el pin (o
// hacer clic en el mapa) para acomodarlo. Mejor sobre la calle que justo sobre
// la casa: el mapa público muestra este punto.

export type Zone = { lat: number; lng: number } | null;

const PARANA_CENTER: [number, number] = [-31.7413, -60.5115];
const PIN = L.divIcon({
  className: "",
  html: `<svg width="30" height="40" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.35))"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z" fill="#2D3191" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="6.5" fill="#fff"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

function ClickToPlace({ onPick }: { onPick: (zone: Zone) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Cuando el pin se pone con el buscador, el mapa se mueve hasta ahí.
function FlyTo({ target }: { target: { lat: number; lng: number; n: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], 16);
  }, [target, map]);
  return null;
}

interface ZonePickerProps {
  value: Zone;
  onChange: (zone: Zone) => void;
  /** Dirección cargada en el formulario, para buscarla de una. */
  address?: string;
  city?: string;
}

export default function ZonePicker({ value, onChange, address = "", city = "Paraná" }: ZonePickerProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; n: number } | null>(null);

  const search = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, city: city || "Paraná" });
      const found = await customFetch<{ lat: number; lng: number }>(`/api/geocode?${params.toString()}`, { method: "GET" });
      onChange(found);
      setFlyTarget({ ...found, n: Date.now() });
    } catch {
      setError("No encontramos esa calle. Probá escribirla de otra forma, o hacé clic en el mapa.");
    } finally {
      setSearching(false);
    }
  };

  const markerHandlers = useMemo(
    () => ({
      dragend(e: L.LeafletEvent) {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        onChange({ lat, lng });
      },
    }),
    [onChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter busca (sin mandar todo el formulario).
            if (e.key === "Enter") {
              e.preventDefault();
              void search(query);
            }
          }}
          placeholder='Escribí la calle, ej.: "Corrientes 293" o "Corrientes y Urquiza"'
          aria-label="Buscar calle para ubicar el pin"
        />
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="secondary" onClick={() => void search(query)} disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-2">Buscar</span>
          </Button>
          {address.trim() && (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setQuery(address); void search(address); }}
              disabled={searching}
            >
              Usar la dirección cargada
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="h-72 rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={value ? [value.lat, value.lng] : PARANA_CENTER}
          zoom={value ? 15 : 12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={onChange} />
          <FlyTo target={flyTarget} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={PIN} draggable eventHandlers={markerHandlers} />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {value
            ? "Arrastrá el pin (o hacé clic en el mapa) para acomodarlo. Ponelo sobre la calle, no justo sobre la casa."
            : "Todavía no tiene pin. Buscá la calle arriba, hacé clic en el mapa, o dejalo así y se ubica solo al guardar."}
        </p>
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
            Ubicar automáticamente al guardar
          </Button>
        )}
      </div>
    </div>
  );
}
