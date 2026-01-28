import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
});

export const unitTypes = ["حبة", "دزينة", "كيلو"] as const;
export type UnitType = typeof unitTypes[number];

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  unitType: text("unit_type").notNull().default("حبة"),
  image: text("image").notNull(),
  isPopular: boolean("is_popular").default(false),
});

export const deliveryLocations = pgTable("delivery_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertDeliveryLocationSchema = createInsertSchema(deliveryLocations).omit({ id: true });

export const updateProductPriceSchema = z.object({
  price: z.number().min(0),
  unitType: z.enum(unitTypes).optional(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type DeliveryLocation = typeof deliveryLocations.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertDeliveryLocation = z.infer<typeof insertDeliveryLocationSchema>;
export type UpdateProductPrice = z.infer<typeof updateProductPriceSchema>;
