// Las fotos están en Cloudinary, que puede entregar versiones más livianas
// agregando parámetros a la URL: formato automático (WebP/AVIF), calidad
// automática y ancho máximo. Una foto de 1,2 MB pasa a pesar ~80-150 KB.
export function optimizedImage(url: string | null | undefined, width: number): string {
  if (!url) return "";
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  const [before, after] = url.split(marker);
  // Si ya tiene transformaciones (ej. "w_400,..."), no se tocan.
  if (/^[a-z]{1,3}_[^/]+\//.test(after)) return url;
  return `${before}${marker}f_auto,q_auto,c_limit,w_${width}/${after}`;
}
