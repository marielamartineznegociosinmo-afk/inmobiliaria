import { and, eq, isNull } from "drizzle-orm";
import { db, propertiesTable } from "@workspace/db";
import { logger } from "./logger";

// Ubica cada propiedad en el mapa SOBRE SU CALLE, pero no en la casa exacta,
// usando el buscador gratuito de OpenStreetMap (Nominatim):
//  - con altura ("Corrientes 293") se busca la mitad de la cuadra
//    ("Corrientes 250"), nunca el número real;
//  - sin altura o en esquinas, se busca solo el nombre de la calle;
//  - si no encuentra la calle, se usa el barrio.

type Coords = { lat: number; lng: number };
type PropertyLocation = { id: number; address: string; neighborhood: string; city: string };

const USER_AGENT = "mariela-inmobiliaria-web/1.0 (+https://marielamartinezinmobiliaria.com.ar)";

// Nominatim permite como máximo 1 consulta por segundo: todas pasan por esta cola.
let queue: Promise<unknown> = Promise.resolve();
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => new Promise((r) => setTimeout(r, 1100)),
    () => new Promise((r) => setTimeout(r, 1100)),
  );
  return run;
}

async function search(query: string): Promise<Coords | null> {
  return throttled(async () => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" }, signal: controller.signal });
      if (!res.ok) return null;
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      return results[0] ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) } : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  });
}

// Abreviaturas comunes en nombres de calles.
const ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bcnel\.?(?=\s)/gi, "Coronel"],
  [/\bgral\.?(?=\s)/gi, "General"],
  [/\bpres\.?(?=\s)/gi, "Presidente"],
  [/\bdr\.?(?=\s)/gi, "Doctor"],
  [/\bav\.?(?=\s)/gi, "Avenida"],
  [/\bbv\.?(?=\s)/gi, "Bulevar"],
  [/\bpje\.?(?=\s)/gi, "Pasaje"],
];

function expandAbbreviations(text: string): string {
  return ABBREVIATIONS.reduce((t, [re, full]) => t.replace(re, full), text).replace(/\s+/g, " ").trim();
}

// "Esquina de Garrigó y Villa Seguí" -> ["Garrigó", "Villa Seguí"]
// "Calle Medus" -> ["Medus"], "Corrientes 293" -> ["Corrientes"]
function streetNames(address: string): string[] {
  return expandAbbreviations(address)
    .replace(/^\s*(?:esquina|esq\.?)(?=[\s.])\.?\s*(?:de\s+)?/i, "")
    .split(/\s*(?:&|\/|\by\b|\be\b|\besquina\b|\besq\.|\besq(?=\s))\s*/i)
    .map((s) => s.replace(/^\s*calle\s+/i, "").replace(/\s+(?:km\s*)?(?:n[°º]?\s*)?\d+.*$/i, "").trim())
    .filter((s) => s.length > 2);
}

// "Corrientes 293" -> "Corrientes 250" (mitad de la misma cuadra).
// Devuelve null si la dirección no tiene altura (o es "Km 5,5").
function midBlockAddress(address: string): string | null {
  const clean = expandAbbreviations(address).replace(/^\s*calle\s+/i, "");
  const m = /^(.*?[^\d\s])\s+(?:n[°º]?\s*)?(\d{2,5})\b/i.exec(clean);
  if (!m || /\bkm\.?$/i.test(m[1])) return null;
  const block = Math.floor(Number(m[2]) / 100) * 100 + 50;
  return `${m[1].trim()} ${block}`;
}

export async function geocodeProperty(p: PropertyLocation): Promise<Coords | null> {
  const city = p.city?.trim() || "Paraná";
  const suffix = `${city}, Entre Ríos, Argentina`;
  const attempts: string[] = [];
  const midBlock = midBlockAddress(p.address ?? "");
  if (midBlock) attempts.push(`${midBlock}, ${suffix}`);
  for (const street of streetNames(p.address ?? "")) attempts.push(`${street}, ${suffix}`);
  // "Zona centro", "Zona sur", etc. no son barrios que el buscador conozca.
  if (p.neighborhood?.trim() && !/^zona\b/i.test(p.neighborhood.trim())) attempts.push(`${p.neighborhood.trim()}, ${suffix}`);

  for (const query of [...new Set(attempts)]) {
    const found = await search(query);
    if (found) return found;
  }
  return null;
}

// Busca la zona de una propiedad y la guarda, sin frenar la respuesta al panel.
export function geocodeInBackground(p: PropertyLocation): void {
  void (async () => {
    try {
      const coords = await geocodeProperty(p);
      if (!coords) {
        logger.warn({ id: p.id }, "No se pudo ubicar la propiedad en el mapa");
        return;
      }
      // Solo si nadie la ubicó a mano mientras tanto.
      await db.update(propertiesTable)
        .set({ mapLatitude: coords.lat, mapLongitude: coords.lng })
        .where(and(eq(propertiesTable.id, p.id), isNull(propertiesTable.mapLatitude)));
    } catch (err) {
      logger.error({ err, id: p.id }, "Error ubicando la propiedad en el mapa");
    }
  })();
}

// Al arrancar el servidor, ubica las propiedades que todavía no tienen zona.
export async function geocodeMissingProperties(): Promise<void> {
  const missing = await db
    .select({ id: propertiesTable.id, address: propertiesTable.address, neighborhood: propertiesTable.neighborhood, city: propertiesTable.city })
    .from(propertiesTable)
    .where(isNull(propertiesTable.mapLatitude));
  if (missing.length === 0) return;
  logger.info({ count: missing.length }, "Ubicando propiedades en el mapa");
  let located = 0;
  for (const p of missing) {
    const coords = await geocodeProperty(p);
    if (!coords) continue;
    await db.update(propertiesTable)
      .set({ mapLatitude: coords.lat, mapLongitude: coords.lng })
      .where(and(eq(propertiesTable.id, p.id), isNull(propertiesTable.mapLatitude)));
    located++;
  }
  logger.info({ located, total: missing.length }, "Propiedades ubicadas en el mapa");
}
