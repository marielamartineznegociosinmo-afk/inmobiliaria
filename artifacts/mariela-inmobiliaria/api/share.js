// Vista previa al compartir una propiedad (WhatsApp, Facebook, Telegram...).
//
// Esas apps no ejecutan JavaScript: leen el HTML tal cual llega y buscan las
// etiquetas og:title / og:image. Como la web arma cada página con JavaScript,
// sin esto todas las propiedades se veían con el título y logo genéricos.
//
// vercel.json manda acá SOLO los pedidos de esos robots (por User-Agent) a
// /propiedades/<link>. Las personas reciben la web normal, sin pasar por acá.

const SITE_URL = "https://marielamartinezinmobiliaria.com.ar";
const API_URL = process.env.VITE_API_URL || "https://inmobiliaria-5s58.onrender.com";

const TYPE_LABELS = {
  casa: "Casa", departamento: "Departamento", terreno: "Terreno", local: "Local",
  oficina: "Oficina", campo: "Campo", cochera: "Cochera", galpon: "Galpón",
};

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Foto en JPG de 1200x630, el formato que mejor muestran WhatsApp y Facebook.
function shareImage(url) {
  if (!url) return `${SITE_URL}/opengraph.jpg`;
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  const [before, after] = url.split(marker);
  return `${before}${marker}f_jpg,q_auto,c_fill,g_auto,w_1200,h_630/${after}`;
}

function setTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `    ${replacement}\n  </head>`);
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").slice(0, 300);

  // HTML base de la web (el mismo que recibe cualquier visitante).
  let html;
  try {
    const page = await fetchWithTimeout(`${SITE_URL}/index.html`, 4000);
    html = await page.text();
  } catch {
    res.status(502).send("No disponible");
    return;
  }

  let property = null;
  try {
    // El servidor gratuito puede estar dormido: si tarda, se manda la vista genérica.
    const r = await fetchWithTimeout(`${API_URL}/api/properties/by-slug/${encodeURIComponent(slug)}`, 4500);
    if (r.ok) property = await r.json();
  } catch {
    // vista genérica
  }

  if (property) {
    const type = TYPE_LABELS[property.type] || property.type;
    const price = Number(property.price) > 0 ? `${property.currency} ${Number(property.price).toLocaleString("es-AR")}` : "Consultar precio";
    const title = `${type} en ${property.operation} en ${property.neighborhood} · ${price}`;
    const details = [
      property.title,
      property.bedrooms != null ? `${property.bedrooms} dorm.` : "",
      property.totalArea ? `${property.totalArea} m²` : "",
      property.creditEligible ? "Apto crédito" : "",
      `${property.neighborhood}, ${property.city}`,
    ].filter(Boolean).join(" · ");
    const image = shareImage(property.coverPhoto || (property.photos || [])[0]);
    const url = `${SITE_URL}/propiedades/${slug}`;

    const t = escapeHtml(title);
    const d = escapeHtml(details.slice(0, 200));
    const i = escapeHtml(image);
    const u = escapeHtml(url);

    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t} | Mariela Martínez</title>`);
    html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
    html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${u}" />`);
    html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
    html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
    html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${u}" />`);
    html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${i}" />`);
    html = setTag(html, /<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${escapeHtml(property.title)}" />`);
    html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${t}" />`);
    html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${d}" />`);
    html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${i}" />`);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Se guarda 10 minutos en Vercel: si se comparte muchas veces, no consulta cada vez.
  res.setHeader("Cache-Control", property ? "public, s-maxage=600, stale-while-revalidate=86400" : "no-store");
  res.status(200).send(html);
}
