import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
    // Manually parse query params since Express doesn't auto-coerce types exactly like Zod wants sometimes
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

  app.get(api.offers.list.path, async (_req, res) => {
    const offers = await storage.getOffers();
    res.json(offers);
  });

  // === Seeding ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Arabic Data Seeding
  await storage.seedCategories([
    { name: "مقبلات", slug: "appetizers", image: "/images/hero1.png" },
    { name: "أطباق رئيسية", slug: "main-dishes", image: "/images/hero2.png" },
    { name: "حلويات", slug: "desserts", image: "/images/hero1.png" },
  ]);

  // Get categories to link products
  const categories = await storage.getCategories();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));

  if (catMap.size > 0) {
    await storage.seedProducts([
      // Appetizers
      { 
        categoryId: catMap.get("appetizers"), 
        name: "كبة مقلية", 
        description: "كبة محشوة باللحم والصنوبر مقلية ومقرمشة", 
        price: 500, // 5.00
        image: "/images/hero2.png",
        isPopular: true
      },
      { 
        categoryId: catMap.get("appetizers"), 
        name: "سمبوسة", 
        description: "سمبوسة هشة بحشوة الجبن أو اللحم", 
        price: 300, 
        image: "/images/hero1.png",
        isPopular: true
      },
      { 
        categoryId: catMap.get("appetizers"), 
        name: "ورق عنب", 
        description: "ورق عنب بخلطة الأرز والليمون المميزة", 
        price: 600, 
        image: "/images/hero2.png",
        isPopular: true
      },
      // Main Dishes
      { 
        categoryId: catMap.get("main-dishes"), 
        name: "كبة مشوية", 
        description: "كبة مشوية على الفحم بنكهة الشواء الأصيلة", 
        price: 1200, 
        image: "/images/hero1.png",
        isPopular: true
      },
      { 
        categoryId: catMap.get("main-dishes"), 
        name: "منسف أردني", 
        description: "منسف باللحم البلدي والجميد الكركي", 
        price: 2500, 
        image: "/images/hero2.png",
        isPopular: false
      },
      // Desserts
      { 
        categoryId: catMap.get("desserts"), 
        name: "كنافة نابلسية", 
        description: "كنافة بالجبنة الساخنة والقطر", 
        price: 800, 
        image: "/images/hero1.png",
        isPopular: true
      },
    ]);

    await storage.seedOffers([
      {
        title: "عرض العائلة",
        description: "احصل على كيلو كبة مشوية + نصف كيلو ورق عنب بسعر مميز",
        originalPrice: 3000,
        discountedPrice: 2500,
        image: "/images/hero2.png"
      },
      {
        title: "عرض الجمعة",
        description: "خصم 20% على جميع المقبلات",
        originalPrice: 1000,
        discountedPrice: 800,
        image: "/images/hero1.png"
      }
    ]);
  }
  
  console.log("Database seeded successfully.");
}
