// Función de Vercel que arma /sitemap.xml en el momento con todas las
// propiedades activas, para que Google las encuentre apenas se publican.
// La regla en vercel.json hace que /sitemap.xml llegue acá.
//
// La lógica del link (slugify / propertySlug) es la misma que en
// src/lib/property-url.ts: si cambia una, cambiar la otra.

const SITE_URL = "https://marielamartinezinmobiliaria.com.ar";
const API_URL = process.env.VITE_API_URL || "https://inmobiliaria-5s58.onrender.com";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/propiedades", priority: "0.9", changefreq: "daily" },
  { path: "/tasaciones", priority: "0.6", changefreq: "monthly" },
  { path: "/nosotros", priority: "0.5", changefreq: "monthly" },
  { path: "/nosotros/calculadora-de-alquileres", priority: "0.5", changefreq: "monthly" },
  { path: "/contacto", priority: "0.5", changefreq: "monthly" },
];

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function propertySlug(p) {
  const place = slugify(p.neighborhood ?? "") === slugify(p.city ?? "") ? [p.neighborhood] : [p.neighborhood, p.city];
  const identifier = (p.propertyCode && String(p.propertyCode).trim()) || String(p.id);
  return slugify([p.type, "en", p.operation, ...place, identifier].filter(Boolean).join(" "));
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(_req, res) {
  let properties = [];
  try {
    // El servidor en Render (plan gratis) puede tardar en despertar.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const r = await fetch(`${API_URL}/api/properties?active=true`, { signal: controller.signal });
    clearTimeout(timer);
    if (r.ok) {
      const data = await r.json();
      properties = Array.isArray(data) ? data : [];
    }
  } catch {
    // Si la API no responde, igual devolvemos las páginas fijas.
  }

  const urls = [
    ...STATIC_PAGES.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
    ...properties
      .filter((p) => p && p.active !== false)
      .map((p) => {
        const lastmod = p.updatedAt ? `<lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : "";
        return `  <url><loc>${escapeXml(`${SITE_URL}/propiedades/${propertySlug(p)}`)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Vercel lo guarda en caché 1 hora para no consultar la API en cada visita de Google.
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
