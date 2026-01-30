import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertDeliveryLocationSchema, updateProductPriceSchema } from "@shared/schema";
import ImageKit from "imagekit";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === API Routes ===

  app.get(api.categories.list.path, async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const category = await storage.getCategory(Number(req.params.id));
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  });

  app.get(api.products.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const isPopular = req.query.isPopular === 'true';
    
    const products = await storage.getProducts(categoryId, isPopular);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.get("/api/delivery-locations", async (_req, res) => {
    const locations = await storage.getDeliveryLocations();
    res.json(locations);
  });

  // === Create Routes ===
  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data as any);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.post("/api/delivery-locations", async (req, res) => {
    try {
      const data = insertDeliveryLocationSchema.parse(req.body);
      const location = await storage.createDeliveryLocation(data);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid delivery location data" });
    }
  });

  // === Update Routes ===
  app.patch("/api/products/:id/price", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const data = updateProductPriceSchema.parse(req.body);
      const product = await storage.updateProductPrice(id, data.price, data.unitType);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // === Delete Routes ===
  app.delete("/api/delivery-locations/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteDeliveryLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Delivery location not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete" });
    }
  });

  // === ImageKit Auth ===
  app.get("/api/imagekit/auth", (_req, res) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !publicKey || !urlEndpoint) {
      return res.status(500).json({ message: "ImageKit not configured" });
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    const authParams = imagekit.getAuthenticationParameters();
    res.json({ ...authParams, publicKey });
  });

  // === Seeding ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    console.log("Seeding database (skipping products)...");
    
    // We clear current data by not seeding anything or providing empty arrays
    // if the user wants to remove ALL products.
    // To completely clear the DB tables we would need a storage method.
    // For now, we just stop adding the default products.
    
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Database seeding failed, but app will continue with memory fallback if possible:", error);
  }
}
