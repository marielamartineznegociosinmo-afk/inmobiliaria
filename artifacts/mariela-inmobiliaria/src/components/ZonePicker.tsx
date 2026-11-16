import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

// Mapita del panel para elegir la ubicación APROXIMADA de una propiedad.
// Se hace clic donde va el pin; no hace falta que sea exacto (mejor que no
// lo sea: el mapa público muestra este punto).

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

export default function ZonePicker({ value, onChange }: { value: Zone; onChange: (zone: Zone) => void }) {
  return (
    <div className="space-y-3">
      <div className="h-72 rounded-xl overflow-hidden border relative z-0">
        <MapContainer
          center={value ? [value.lat, value.lng] : PARANA_CENTER}
          zoom={value ? 14 : 12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={onChange} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={PIN} />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {value
            ? "Hacé clic en el mapa para mover el pin. Ponelo en la zona, no justo sobre la casa: el mapa público muestra este punto."
            : "Todavía no está ubicada. Se ubica sola al guardar, o hacé clic en el mapa para poner el pin en la zona."}
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
