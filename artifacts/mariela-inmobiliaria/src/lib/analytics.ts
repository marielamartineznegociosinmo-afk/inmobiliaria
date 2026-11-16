import { useEffect } from "react";
import { useLocation } from "wouter";

// Google Analytics 4. Se activa solo cuando VITE_GA_ID (el código "G-XXXX"
// de Google Analytics) está configurado en vercel.json. Sin código, no hace nada.
const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let initialized = false;

function init() {
  if (initialized || !GA_ID || typeof window === "undefined") return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // La web es de una sola página: las visitas se mandan a mano en cada cambio
  // de ruta (ver usePageViews), por eso se apaga el envío automático.
  window.gtag("config", GA_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

// Registra una visita cada vez que cambia la página. Las páginas de
// administración no se cuentan.
export function usePageViews() {
  const [location] = useLocation();
  useEffect(() => {
    if (!GA_ID || location.startsWith("/admin")) return;
    init();
    // Pequeña espera para que la página ya haya actualizado su título.
    const t = setTimeout(() => {
      trackEvent("page_view", {
        page_path: location,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [location]);
}
