import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

interface PropertyMapProps {
  address: string;
  neighborhood: string;
  city: string;
}

// Clave opcional de la "Maps Embed API" de Google (gratis y sin límite de uso).
// Si no está configurada, se usa el embed público de Google Maps, que no
// necesita clave.
const EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY as string | undefined;

// Normaliza direcciones de esquina para que Google las entienda como cruce de
// calles. Ej.: "Esquina de Garrigó y Villa Seguí" -> "Garrigó y Villa Seguí",
// "Solá & Villaguay" -> "Solá y Villaguay", "Belgrano esq. San Martín" ->
// "Belgrano y San Martín".
function normalizeAddress(address: string): string {
  return address
    .replace(/^\s*(?:esquina|esq\.?)(?=[\s.])\.?\s*(?:de\s+)?/i, "")
    .replace(/\s*(?:&|\/|\besquina\b|\besq\.|\besq(?=\s))\s*/gi, " y ")
    .replace(/\s+/g, " ")
    .trim();
}

export function PropertyMap({ address, neighborhood, city }: PropertyMapProps) {
  const [loaded, setLoaded] = useState(false);

  // El barrio no se incluye en la búsqueda (a veces confunde al buscador);
  // solo se usa si no hay dirección cargada.
  const street = address ? normalizeAddress(address) : neighborhood;
  const query = [street, city, "Entre Ríos", "Argentina"].filter(Boolean).join(", ");
  const q = encodeURIComponent(query);

  const embedUrl = EMBED_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${EMBED_API_KEY}&q=${q}&zoom=16&language=es`
    : `https://maps.google.com/maps?q=${q}&z=16&hl=es&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="space-y-2">
      <div className="aspect-video rounded-xl overflow-hidden border relative z-0 bg-muted">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <MapPin className="w-8 h-8 text-primary mb-2" />
            <p className="font-semibold">{neighborhood}</p>
            <p className="text-sm text-muted-foreground">{city}</p>
            <p className="text-xs text-muted-foreground mt-2">Cargando mapa…</p>
          </div>
        )}
        <iframe
          key={embedUrl}
          title={`Mapa: ${query}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Ver en Google Maps <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
