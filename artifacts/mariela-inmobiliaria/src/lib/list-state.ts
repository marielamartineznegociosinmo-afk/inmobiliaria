// Recuerda la última búsqueda en Propiedades (filtros, orden, lista o mapa)
// para que "Volver a resultados" vuelva exactamente ahí.
const KEY = "last-properties-list-url";

export function saveLastListUrl(url: string): void {
  try {
    sessionStorage.setItem(KEY, url);
  } catch {
    // Navegación privada o almacenamiento bloqueado: se vuelve a /propiedades.
  }
}

export function getLastListUrl(): string {
  try {
    const url = sessionStorage.getItem(KEY);
    if (url && url.startsWith("/propiedades")) return url;
  } catch {
    // idem
  }
  return "/propiedades";
}
