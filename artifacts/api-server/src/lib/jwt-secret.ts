import { logger } from "./logger";

// Llave para firmar las sesiones del panel. Tiene que venir SOLO de la
// variable JWT_SECRET de Render: el código es público en GitHub, así que una
// llave escrita acá la podría usar cualquiera para entrar al panel.
//
// Si falta (o es la llave vieja que estaba escrita en el código), el panel no
// deja iniciar sesión, pero la web pública sigue funcionando normal.
const OLD_PUBLIC_SECRET = "mariela-inmobiliaria-secret-key-2024";

const raw = process.env.JWT_SECRET?.trim();
export const JWT_SECRET: string | null = raw && raw !== OLD_PUBLIC_SECRET ? raw : null;

if (!JWT_SECRET) {
  logger.error("JWT_SECRET falta o es la llave pública vieja: el panel de administración queda bloqueado hasta configurarla en Render.");
}
