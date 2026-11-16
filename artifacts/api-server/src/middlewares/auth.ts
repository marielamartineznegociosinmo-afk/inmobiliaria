import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../lib/jwt-secret";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!JWT_SECRET) {
    res.status(503).json({ error: "Panel no disponible: falta configurar JWT_SECRET" });
    return;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as Request & { admin: unknown }).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
