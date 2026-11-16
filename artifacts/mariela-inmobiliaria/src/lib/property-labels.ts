// Nombres para mostrar de cada tipo de propiedad (con acentos y mayúscula).
export const TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local: "Local",
  oficina: "Oficina",
  campo: "Campo",
  cochera: "Cochera",
  galpon: "Galpón",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

// Moneda en la que se suele publicar cada operación.
export const DEFAULT_CURRENCY: Record<string, "USD" | "ARS"> = {
  venta: "USD",
  alquiler: "ARS",
};
