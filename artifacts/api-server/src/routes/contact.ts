import { Router, type IRouter } from "express";
import { Resend } from "resend";

const router: IRouter = Router();

const CONTACT_EMAIL = "marielamartineznegociosinmo@gmail.com";

router.post("/contact", async (req, res): Promise<void> => {
  const { name, phone, reason, message } = (req.body ?? {}) as {
    name?: string;
    phone?: string;
    reason?: string;
    message?: string;
  };

  if (!name?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Falta el nombre o el mensaje." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    req.log?.error("RESEND_API_KEY no está configurada; no se pudo enviar la consulta de contacto.");
    res.status(500).json({ error: "El envío de consultas no está disponible en este momento." });
    return;
  }

  const bodyLines = [
    `Nombre: ${name.trim()}`,
    phone?.trim() && `Teléfono: ${phone.trim()}`,
    reason?.trim() && `Motivo: ${reason.trim()}`,
    "",
    "Mensaje:",
    message.trim(),
  ].filter((line): line is string => Boolean(line));

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Sitio web Mariela Martínez <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      subject: `Nueva consulta de ${name.trim()}${reason?.trim() ? ` — ${reason.trim()}` : ""}`,
      text: bodyLines.join("\n"),
    });

    if (error) {
      req.log?.error({ error }, "Resend devolvió un error al enviar la consulta de contacto.");
      res.status(502).json({ error: "No se pudo enviar la consulta. Probá de nuevo en un momento." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    req.log?.error({ error }, "Error inesperado enviando la consulta de contacto.");
    res.status(500).json({ error: "Ocurrió un error inesperado al enviar la consulta." });
  }
});

export default router;
