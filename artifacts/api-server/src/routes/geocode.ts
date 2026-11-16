import { Router, type IRouter } from "express";
import { authMiddleware } from "../middlewares/auth";
import { geocodeProperty } from "../lib/geocode";

const router: IRouter = Router();

// Buscador del panel: "Corrientes 293" o "Corrientes y Urquiza" -> punto
// sobre esa calle (mitad de cuadra, nunca la casa exacta). Solo para admins.
router.get("/geocode", authMiddleware, async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : "";
  const city = typeof req.query.city === "string" && req.query.city.trim() ? req.query.city.trim().slice(0, 100) : "Paraná";
  if (!q) {
    res.status(400).json({ error: "Falta la dirección a buscar" });
    return;
  }
  const found = await geocodeProperty({ id: 0, address: q, neighborhood: "", city });
  if (!found) {
    res.status(404).json({ error: "No se encontró esa calle" });
    return;
  }
  res.json(found);
});

export default router;
