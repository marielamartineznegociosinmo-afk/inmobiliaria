import { useEffect } from "react";

export const SITE_URL = "https://marielamartinezinmobiliaria.com.ar";
const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;

interface SeoOptions {
  title: string;
  description: string;
  /** Ruta canónica de la página, por ejemplo "/propiedades". */
  path: string;
  image?: string | null;
  /** Datos estructurados (schema.org) para que Google entienda la página. */
  jsonLd?: Record<string, unknown> | null;
  /** false para que Google no la indexe (por ejemplo, la página 404). */
  index?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absolute(url: string) {
  return /^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Actualiza título, descripción, link canónico y vista previa para
// Google/WhatsApp/Facebook de cada página.
export function useSeo({ title, description, path, image, jsonLd, index = true }: SeoOptions) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const url = absolute(path);
    const img = image ? absolute(image) : DEFAULT_IMAGE;
    const desc = description.replace(/\s+/g, " ").trim().slice(0, 160);

    document.title = title;
    setMeta("name", "description", desc);
    setMeta("name", "robots", index ? "index, follow" : "noindex, follow");
    setCanonical(url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seo = "page";
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }
    return () => {
      script?.remove();
    };
  }, [title, description, path, image, jsonLdText, index]);
}
