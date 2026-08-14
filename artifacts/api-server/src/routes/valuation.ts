import { Router, type IRouter } from "express";
import { Resend } from "resend";

const router: IRouter = Router();

const VALUATION_EMAIL = "marielamartineznegociosinmo@gmail.com";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local: "Local",
  oficina: "Oficina",
  campo: "Campo",
  cochera: "Cochera",
};

router.post("/valuation", async (req, res): Promise<void> => {
  const { name, phone, propertyType, neighborhood, message } = (req.body ?? {}) as {
    name?: string;
    phone?: string;
    propertyType?: string;
    neighborhood?: string;
    message?: string;
  };

  if (!name?.trim()) {
    res.status(400).json({ error: "Falta el nombre." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    req.log?.error("RESEND_API_KEY no está configurada; no se pudo enviar la solicitud de tasación.");
    res.status(500).json({ error: "El envío de solicitudes no está disponible en este momento." });
    return;
  }

  const propertyTypeLabel = propertyType?.trim() ? PROPERTY_TYPE_LABELS[propertyType.trim()] ?? propertyType.trim() : undefined;

  const bodyLines = [
    `Nombre: ${name.trim()}`,
    phone?.trim() && `Teléfono: ${phone.trim()}`,
    propertyTypeLabel && `Tipo de propiedad: ${propertyTypeLabel}`,
    neighborhood?.trim() && `Barrio o zona: ${neighborhood.trim()}`,
    message?.trim() && ["", "Mensaje:", message.trim()].join("\n"),
  ].filter((line): line is string => Boolean(line));

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Sitio web Mariela Martínez <onboarding@resend.dev>",
      to: VALUATION_EMAIL,
      subject: `Nueva solicitud de tasación de ${name.trim()}`,
      text: bodyLines.join("\n"),
    });

    if (error) {
      req.log?.error({ error }, "Resend devolvió un error al enviar la solicitud de tasación.");
      res.status(502).json({ error: "No se pudo enviar la solicitud. Probá de nuevo en un momento." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    req.log?.error({ error }, "Error inesperado enviando la solicitud de tasación.");
    res.status(500).json({ error: "Ocurrió un error inesperado al enviar la solicitud." });
  }
});

export default router;
