import type { Property } from "@workspace/api-client-react";

// Pasa un texto a formato de URL: minúsculas, sin acentos, palabras con "-".
// Debe coincidir con slugify() del servidor (api-server/src/routes/properties.ts).
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type PropertyUrlFields = Pick<Property, "id" | "type" | "operation" | "neighborhood" | "city" | "propertyCode">;

// Arma el link público de una propiedad:
//   /propiedades/casa-en-venta-barrio-parque-parana-mm-00107
// Siempre termina con el código de la propiedad (o el número interno si no
// tiene código), que es lo que usa el servidor para encontrarla.
export function propertySlug(p: PropertyUrlFields): string {
  const place = slugify(p.neighborhood ?? "") === slugify(p.city ?? "")
    ? [p.neighborhood]
    : [p.neighborhood, p.city];
  const identifier = p.propertyCode?.trim() || String(p.id);
  return slugify([p.type, "en", p.operation, ...place, identifier].filter(Boolean).join(" "));
}

export function propertyPath(p: PropertyUrlFields): string {
  return `/propiedades/${propertySlug(p)}`;
}
