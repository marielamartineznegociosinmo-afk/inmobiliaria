import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql, ne, notInArray } from "drizzle-orm";
import { db, propertiesTable } from "@workspace/db";
import {
  ListPropertiesQueryParams,
  ListPropertiesResponse,
  CreatePropertyBody,
  GetPropertyParams,
  GetPropertyBySlugParams,
  GetPropertyResponse,
  UpdatePropertyParams,
  UpdatePropertyBody,
  UpdatePropertyResponse,
  DeletePropertyParams,
  DeletePropertyResponse,
  GetFeaturedPropertiesResponse,
  GetPropertyStatsResponse,
  GetRelatedPropertiesParams,
  GetRelatedPropertiesResponse,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";
import { geocodeInBackground } from "../lib/geocode";

const router: IRouter = Router();

router.get("/properties", async (req, res): Promise<void> => {
  const parsed = ListPropertiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data;
  const conditions = [];

  if (q.operation) conditions.push(eq(propertiesTable.operation, q.operation));
  if (q.type) conditions.push(eq(propertiesTable.type, q.type));
  if (q.neighborhood) conditions.push(sql`lower(${propertiesTable.neighborhood}) like lower(${"%" + q.neighborhood + "%"})`);
  if (q.bedrooms !== undefined) conditions.push(eq(propertiesTable.bedrooms, q.bedrooms));
  if (q.minPrice !== undefined) conditions.push(gte(propertiesTable.price, q.minPrice));
  if (q.maxPrice !== undefined) conditions.push(lte(propertiesTable.price, q.maxPrice));
  if (q.featured !== undefined) conditions.push(eq(propertiesTable.featured, q.featured));
  if (q.active !== undefined) conditions.push(eq(propertiesTable.active, q.active));
  else conditions.push(eq(propertiesTable.active, true));

  let query = db.select().from(propertiesTable).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));
  query = query.orderBy(propertiesTable.createdAt);
  if (q.limit !== undefined) query = query.limit(q.limit);
  if (q.offset !== undefined) query = query.offset(q.offset);

  const rows = await query;
  res.json(ListPropertiesResponse.parse(rows.map(serializeProperty)));
});

router.get("/properties/featured", async (_req, res): Promise<void> => {
  const rows = await db.select().from(propertiesTable)
    .where(and(eq(propertiesTable.featured, true), eq(propertiesTable.active, true)))
    .orderBy(propertiesTable.createdAt)
    .limit(6);
  res.json(GetFeaturedPropertiesResponse.parse(rows.map(serializeProperty)));
});

router.get("/properties/stats", async (_req, res): Promise<void> => {
  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(eq(propertiesTable.active, true));
  const [forSale] = await db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(and(eq(propertiesTable.active, true), eq(propertiesTable.operation, "venta")));
  const [forRent] = await db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable).where(and(eq(propertiesTable.active, true), eq(propertiesTable.operation, "alquiler")));
  const [totalAll] = await db.select({ count: sql<number>`count(*)::int` }).from(propertiesTable);

  const foundedYear = 2020;
  const yearsExperience = new Date().getFullYear() - foundedYear;
  const stats = {
    totalProperties: total?.count ?? 0,
    activeProperties: total?.count ?? 0,
    forSale: forSale?.count ?? 0,
    forRent: forRent?.count ?? 0,
    yearsExperience,
    propertiesSold: totalAll?.count ?? 0,
    happyClients: totalAll?.count ?? 0,
  };
  res.json(GetPropertyStatsResponse.parse(stats));
});

// Pasa un texto a formato de URL: minúsculas, sin acentos, palabras con "-".
// Debe coincidir con slugify() del frontend (src/lib/property-url.ts).
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Busca una propiedad por su link público, por ejemplo
// "casa-en-venta-barrio-parque-parana-mm-00107". El link siempre termina con
// el código de la propiedad (MM-00107); el resto (tipo, barrio, etc.) es
// descriptivo, así que si cambia el barrio los links viejos siguen andando.
// Las propiedades sin código usan el número interno al final.
router.get("/properties/by-slug/:slug", async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const parsed = GetPropertyBySlugParams.safeParse({ slug: rawSlug });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const slug = slugify(parsed.data.slug);

  const withCode = await db
    .select({ id: propertiesTable.id, propertyCode: propertiesTable.propertyCode })
    .from(propertiesTable)
    .where(sql`${propertiesTable.propertyCode} is not null and ${propertiesTable.propertyCode} <> ''`);

  // Si hay más de un código que coincide, gana el más largo (el más específico).
  let matchId: number | undefined;
  let matchLength = 0;
  for (const p of withCode) {
    const code = slugify(p.propertyCode ?? "");
    if (!code) continue;
    if ((slug === code || slug.endsWith(`-${code}`)) && code.length > matchLength) {
      matchId = p.id;
      matchLength = code.length;
    }
  }

  if (matchId === undefined) {
    const trailingId = /(?:^|-)(\d+)$/.exec(slug);
    if (trailingId) matchId = parseInt(trailingId[1], 10);
  }

  const [row] = matchId === undefined
    ? []
    : await db.select().from(propertiesTable).where(eq(propertiesTable.id, matchId));
  if (!row) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }
  res.json(GetPropertyResponse.parse(serializeProperty(row)));
});

router.get("/properties/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetPropertyParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parsed.data.id));
  if (!row) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }
  res.json(GetPropertyResponse.parse(serializeProperty(row)));
});

router.get("/properties/:id/related", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetRelatedPropertiesParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [source] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parsed.data.id));
  if (!source) {
    res.json([]);
    return;
  }

  // Primero, propiedades activas de la misma zona/barrio.
  const sameNeighborhood = await db.select().from(propertiesTable)
    .where(and(
      eq(propertiesTable.active, true),
      eq(propertiesTable.neighborhood, source.neighborhood),
      ne(propertiesTable.id, parsed.data.id)
    ))
    .orderBy(propertiesTable.createdAt)
    .limit(3);

  let related = sameNeighborhood;

  // Si no alcanzan para completar 3, sumamos propiedades del mismo tipo
  // (sin repetir las ya elegidas) para no dejar la sección vacía.
  if (related.length < 3) {
    const excludeIds = [parsed.data.id, ...sameNeighborhood.map((p) => p.id)];
    const sameType = await db.select().from(propertiesTable)
      .where(and(
        eq(propertiesTable.active, true),
        eq(propertiesTable.type, source.type),
        notInArray(propertiesTable.id, excludeIds)
      ))
      .orderBy(propertiesTable.createdAt)
      .limit(3 - related.length);
    related = [...related, ...sameType];
  }

  res.json(GetRelatedPropertiesResponse.parse(related.map(serializeProperty)));
});

router.post("/properties", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(propertiesTable).values({
    ...parsed.data,
    photos: parsed.data.photos ?? [],
    featured: parsed.data.featured ?? false,
    active: parsed.data.active ?? true,
  }).returning();
  if (row.mapLatitude == null || row.mapLongitude == null) geocodeInBackground(row);
  res.status(201).json(GetPropertyResponse.parse(serializeProperty(row)));
});

router.put("/properties/:id", authMiddleware, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = UpdatePropertyParams.safeParse({ id: parseInt(rawId, 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }
  const bodyParsed = UpdatePropertyBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const body = { ...bodyParsed.data };
  const zoneSetByHand = body.mapLatitude !== undefined || body.mapLongitude !== undefined;
  if (!zoneSetByHand && (body.address !== undefined || body.neighborhood !== undefined || body.city !== undefined)) {
    const [current] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, paramsParsed.data.id));
    const moved = current && (
      (body.address !== undefined && body.address !== current.address) ||
      (body.neighborhood !== undefined && body.neighborhood !== current.neighborhood) ||
      (body.city !== undefined && body.city !== current.city)
    );
    // Cambió la dirección: se vuelve a ubicar automáticamente.
    if (moved) {
      body.mapLatitude = null;
      body.mapLongitude = null;
    }
  }
  const [row] = await db.update(propertiesTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(propertiesTable.id, paramsParsed.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }
  if (row.mapLatitude == null || row.mapLongitude == null) geocodeInBackground(row);
  res.json(UpdatePropertyResponse.parse(serializeProperty(row)));
});

router.delete("/properties/:id", authMiddleware, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeletePropertyParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.delete(propertiesTable)
    .where(eq(propertiesTable.id, parsed.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Propiedad no encontrada" });
    return;
  }
  res.json(DeletePropertyResponse.parse({ success: true }));
});

function serializeProperty(row: typeof propertiesTable.$inferSelect) {
  return {
    ...row,
    type: row.type.toLowerCase(),
    operation: row.operation.toLowerCase(),
    photos: row.photos ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
