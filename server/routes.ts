import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertDeliveryLocationSchema, updateProductPriceSchema } from "@shared/schema";
import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

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
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

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

  // === ImageKit Sync - Check for new images and add them as products ===
  app.post("/api/imagekit/sync", async (_req, res) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !publicKey || !urlEndpoint) {
      return res.status(500).json({ message: "ImageKit not configured" });
    }

    try {
      const imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });

      console.log("Fetching files from ImageKit...");
      const files = await imagekit.listFiles({});
      console.log(`ImageKit returned ${files.length} files`);
      if (files.length > 0) {
        console.log("First file sample:", JSON.stringify(files[0], null, 2));
      }

      const newProducts: any[] = [];
      const newCategories: any[] = [];
      const newLocations: any[] = [];
      
      let categories = await storage.getCategories();
      let defaultCategoryId: number;
      
      if (categories.length === 0) {
        const newCategory = await storage.createCategory({
          name: "منتجات",
          slug: "products",
          image: urlEndpoint + "/default-category.jpg",
        });
        defaultCategoryId = newCategory.id;
        categories = [newCategory];
      } else {
        defaultCategoryId = categories[0].id;
      }

      // Arabic translation mapping for products
      const arabicProductNames: { [key: string]: string } = {
        "kibbeh fried": "كبة مقلية",
        "kibbeh grilled": "كبة مشوية",
        "raqayeq cheese": "رقائق جبنة",
        "raqayeq cheese sausage": "رقائق جبنة وسجق",
        "sambousa meat": "سمبوسك لحمة",
        "sambousa cheese": "سمبوسك جبنة",
        "shishbarak": "ششبرك",
        "grape leaves meat": "ورق عنب بلحمة",
        "grape leaves oil": "ورق عنب بزيت",
        "kabba": "كبة",
        "waraq enab": "ورق عنب",
        "sambousa jebna": "سمبوسة جبنة",
        "waraq enab lahme": "ورق عنب مع لحمة",
      };

      // Arabic translation mapping for categories
      const arabicCategoryNames: { [key: string]: string } = {
        "appetizers": "مقبلات",
        "main dishes": "أطباق رئيسية",
        "desserts": "حلويات",
        "drinks": "مشروبات",
        "salads": "سلطات",
      };

      // Arabic translation mapping for delivery locations
      const arabicLocationNames: { [key: string]: string } = {
        "amman": "عمان",
        "zarqa": "الزرقاء",
        "irbid": "إربد",
        "aqaba": "العقبة",
      };

      for (const file of files) {
        if (!('fileId' in file) || !('url' in file)) continue;
        
        const fileId = file.fileId as string;
        const fileUrl = file.url as string;
        const filePath = (file as any).filePath || "";
        const fileName = file.name;
        
        // Skip if it's a directory (ImageKit markers)
        if (fileName.endsWith('/')) continue;
        
        // Use a more robust check for existing synced images
        const existingSynced = await storage.getSyncedImageByFileId(fileId);
        
        if (!existingSynced) {
          // Immediately mark as synced to prevent concurrent syncs from adding the same file
          await storage.createSyncedImage({
            fileId: fileId,
            fileName: fileName,
            url: fileUrl,
            syncedAt: new Date().toISOString(),
          });

          // Also check by URL to be extra safe against duplicates with different IDs
          const allProducts = await storage.getProducts();
          if (allProducts.some(p => p.image === fileUrl)) {
            console.log(`Product with URL ${fileUrl} already exists, skipping...`);
            continue;
          }

          const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const cleanName = rawName.split(/\s\d+/)[0].trim();

          // Determine type based on folder path
          if (filePath.toLowerCase().includes("/categories/")) {
            // Create category
            const arabicName = arabicCategoryNames[cleanName.toLowerCase()] || cleanName;
            const slug = cleanName.toLowerCase().replace(/\s+/g, "-");
            
            const newCategory = await storage.createCategory({
              name: arabicName,
              slug: slug,
              image: fileUrl,
            });
            newCategories.push(newCategory);
            console.log(`Created category: ${arabicName}`);
            
          } else if (filePath.toLowerCase().includes("/locations/") || filePath.toLowerCase().includes("/delivery/")) {
            // Create delivery location
            const arabicName = arabicLocationNames[cleanName.toLowerCase()] || cleanName;
            
            const newLocation = await storage.createDeliveryLocation({
              name: arabicName,
              price: 200, // Default delivery price (2.00$)
              image: fileUrl,
            });
            newLocations.push(newLocation);
            console.log(`Created delivery location: ${arabicName}`);
            
          } else if (filePath.toLowerCase().includes("/منتجات/") || filePath.toLowerCase().includes("/products/")) {
            // Create product (includes /منتجات/ folder specifically)
            const arabicName = arabicProductNames[cleanName.toLowerCase()] || cleanName;

            const newProduct = await storage.createProduct({
              categoryId: defaultCategoryId,
              name: arabicName,
              description: `منتج ${arabicName}`,
              price: 250, // Default price (2.50$)
              unitType: "حبة",
              image: fileUrl,
              isPopular: false,
            });
            newProducts.push(newProduct);
            console.log(`Created product from folder: ${arabicName}`);
          } else {
            // Default: Create product (includes root and other folders)
            const arabicName = arabicProductNames[cleanName.toLowerCase()] || cleanName;

            const newProduct = await storage.createProduct({
              categoryId: defaultCategoryId,
              name: arabicName,
              description: `منتج ${arabicName}`,
              price: 250, // Default price (2.50$)
              unitType: "حبة",
              image: fileUrl,
              isPopular: false,
            });
            newProducts.push(newProduct);
            console.log(`Created product: ${arabicName}`);
          }
        }
      }

      res.json({
        success: true,
        totalFiles: files.length,
        newProductsAdded: newProducts.length,
        newCategoriesAdded: newCategories.length,
        newLocationsAdded: newLocations.length,
        products: newProducts,
        categories: newCategories,
        locations: newLocations,
      });
    } catch (error: any) {
      console.error("ImageKit sync error:", error);
      res.status(500).json({ message: error.message || "Sync failed" });
    }
  });

  // === Seeding ===
  await seedDatabase();

  // === Seed Products Endpoint ===
  app.post("/api/seed-products", async (_req, res) => {
    try {
      const results = await seedProducts();
      res.json({ success: true, count: results.length, products: results });
    } catch (error: any) {
      console.error("Seeding error:", error);
      res.status(500).json({ message: error.message || "Seeding failed" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  try {
    console.log("Seeding database (skipping products)...");
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Database seeding failed, but app will continue with memory fallback if possible:", error);
  }
}

interface ProductData {
  name: string;
  description: string;
  imagePath: string;
}

const productsList: ProductData[] = [
  { name: "كبة مقلية", description: "كبة مقرمشة ولذيذة مقلية بالزيت", imagePath: "generated_images/kibbeh_fried.png" },
  { name: "كبة مشوية", description: "كبة مشوية على الفحم بنكهة مميزة", imagePath: "generated_images/kibbeh_grilled.png" },
  { name: "رقايق جبنة", description: "رقائق مقرمشة محشوة بالجبنة البيضاء", imagePath: "generated_images/raqayeq_cheese.png" },
  { name: "رقايق جبنة وسجق", description: "رقائق محشوة بالجبنة والسجق التركي", imagePath: "generated_images/raqayeq_cheese_sausage.png" },
  { name: "سمبوسك لحمة", description: "سمبوسك مقلي محشو باللحم المفروم والصنوبر", imagePath: "generated_images/sambousa_meat.png" },
  { name: "سمبوسك جبنة", description: "سمبوسك مقلي محشو بالجبنة البيضاء", imagePath: "generated_images/sambousa_cheese.png" },
  { name: "ششبرك لحمة", description: "عجينة محشوة باللحم في صلصة اللبن الكريمية", imagePath: "generated_images/shishbarak.png" },
  { name: "ورق عنب بلحمة", description: "ورق عنب محشو بالأرز واللحم", imagePath: "generated_images/grape_leaves_meat.png" },
  { name: "ورق عنب بزيت", description: "ورق عنب نباتي محشو بالأرز والأعشاب بزيت الزيتون", imagePath: "generated_images/grape_leaves_oil.png" },
];

async function uploadImageToImageKit(localPath: string, fileName: string): Promise<string> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    throw new Error("ImageKit not configured");
  }

  const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  const fileBuffer = fs.readFileSync(localPath);
  const base64File = fileBuffer.toString("base64");
  
  const response = await imagekit.upload({
    file: base64File,
    fileName: fileName,
    folder: "/products",
  });
  
  return response.url;
}

export async function seedProducts() {
  console.log("Starting product seeding...");
  
  const existingCategories = await storage.getCategories();
  let categoryId: number;
  
  if (existingCategories.length === 0) {
    console.log("Creating appetizers category...");
    const categoryImagePath = "generated_images/sambousa_meat.png";
    const categoryImageUrl = await uploadImageToImageKit(categoryImagePath, "appetizers-category.png");
    
    const newCategory = await storage.createCategory({
      name: "مقبلات",
      slug: "appetizers",
      image: categoryImageUrl,
    });
    
    categoryId = newCategory.id;
    console.log(`Created category: ${newCategory.name} (ID: ${categoryId})`);
  } else {
    categoryId = existingCategories[0].id;
    console.log(`Using existing category ID: ${categoryId}`);
  }
  
  console.log("Uploading images and creating products...");
  const results: any[] = [];
  
  for (const product of productsList) {
    try {
      console.log(`Processing: ${product.name}`);
      
      const fileName = path.basename(product.imagePath, ".png") + "-" + Date.now() + ".png";
      const imageUrl = await uploadImageToImageKit(product.imagePath, fileName);
      
      const newProduct = await storage.createProduct({
        categoryId: categoryId,
        name: product.name,
        description: product.description,
        price: 100,
        unitType: "حبة",
        image: imageUrl,
        isPopular: false,
      });
      
      console.log(`Created product: ${newProduct.name} (ID: ${newProduct.id})`);
      results.push(newProduct);
    } catch (error) {
      console.error(`Failed to create product ${product.name}:`, error);
    }
  }
  
  console.log("Seeding completed!");
  return results;
}
