import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  operation: text("operation").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull().default("Paraná"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  coveredArea: real("covered_area"),
  totalArea: real("total_area"),
  garage: boolean("garage"),
  age: integer("age"),
  additionalFeatures: text("additional_features"),
  photos: text("photos").array().notNull().default([]),
  coverPhoto: text("cover_photo"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
