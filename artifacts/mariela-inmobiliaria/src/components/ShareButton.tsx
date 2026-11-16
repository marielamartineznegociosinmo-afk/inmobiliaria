import { useState } from "react";
import { Share2, Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

interface ShareButtonProps {
  title: string;
  text: string;
  /** Ruta de la propiedad, ej. "/propiedades/casa-en-venta-...". */
  path: string;
  trackingCode: string;
}

// "Compartir": en el celular abre el menú del teléfono (WhatsApp, Instagram,
// etc.). En la computadora, donde no siempre existe ese menú, ofrece mandarlo
// por WhatsApp o copiar el link.
export function ShareButton({ title, text, path, trackingCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const url = `${SITE_URL}${path}`;

  const share = async () => {
    trackEvent("share_click", { property_code: trackingCode });
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Si la persona cerró el menú, no hacemos nada más.
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    setShowOptions((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá el link:", url);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-semibold border-primary text-primary hover:bg-primary/5"
        onClick={() => void share()}
        aria-expanded={showOptions}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartir
      </Button>
      {showOptions && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank")}
          >
            Por WhatsApp
          </Button>
          <Button type="button" variant="secondary" onClick={() => void copy()}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
            {copied ? "¡Copiado!" : "Copiar link"}
          </Button>
        </div>
      )}
    </div>
  );
}
