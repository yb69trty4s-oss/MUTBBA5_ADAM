import { db } from "./db";
import {
  categories,
  products,
  deliveryLocations,
  syncedImages,
  type Category,
  type Product,
  type DeliveryLocation,
  type SyncedImage,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getProducts(categoryId?: number, isPopular?: boolean): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getDeliveryLocations(): Promise<DeliveryLocation[]>;
  
  createProduct(data: Omit<Product, 'id'>): Promise<Product>;
  createCategory(data: Omit<Category, 'id'>): Promise<Category>;
  createDeliveryLocation(data: Omit<DeliveryLocation, 'id'>): Promise<DeliveryLocation>;
  
  updateProductPrice(id: number, price?: number, unitType?: string, name?: string): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  deleteDeliveryLocation(id: number): Promise<boolean>;
  
  seedCategories(data: any[]): Promise<void>;
  seedProducts(data: any[]): Promise<void>;
  
  getSyncedImages(): Promise<SyncedImage[]>;
  getSyncedImageByFileId(fileId: string): Promise<SyncedImage | undefined>;
  createSyncedImage(data: Omit<SyncedImage, 'id'>): Promise<SyncedImage>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private deliveryLocations: Map<number, DeliveryLocation>;
  private syncedImagesMap: Map<number, SyncedImage>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.deliveryLocations = new Map();
    this.syncedImagesMap = new Map();
    this.currentIds = { categories: 1, products: 1, deliveryLocations: 1, syncedImages: 1 };
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getProducts(categoryId?: number, isPopular?: boolean): Promise<Product[]> {
    let allProducts = Array.from(this.products.values());
    if (categoryId) {
      allProducts = allProducts.filter(p => p.categoryId === categoryId);
    }
    if (isPopular) {
      allProducts = allProducts.filter(p => p.isPopular);
    }
    return allProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getDeliveryLocations(): Promise<DeliveryLocation[]> {
    return Array.from(this.deliveryLocations.values());
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const id = this.currentIds.categories++;
    const category = { ...data, id };
    this.categories.set(id, category);
    return category;
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const id = this.currentIds.products++;
    const product = { ...data, id, isPopular: data.isPopular ?? false, categoryId: data.categoryId ?? null };
    this.products.set(id, product as Product);
    return product as Product;
  }

  async createDeliveryLocation(data: Omit<DeliveryLocation, 'id'>): Promise<DeliveryLocation> {
    const id = this.currentIds.deliveryLocations++;
    const location = { ...data, id };
    this.deliveryLocations.set(id, location);
    return location;
  }

  async updateProductPrice(id: number, price?: number, unitType?: string, name?: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { 
      ...product, 
      price: price !== undefined ? price : product.price, 
      unitType: unitType || product.unitType,
      name: name || product.name
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async deleteDeliveryLocation(id: number): Promise<boolean> {
    return this.deliveryLocations.delete(id);
  }

  async seedCategories(data: any[]): Promise<void> {
    if (this.categories.size === 0) {
      for (const cat of data) {
        await this.createCategory(cat);
      }
    }
  }

  async seedProducts(data: any[]): Promise<void> {
    if (this.products.size === 0) {
      for (const prod of data) {
        await this.createProduct(prod);
      }
    }
  }

  async getSyncedImages(): Promise<SyncedImage[]> {
    return Array.from(this.syncedImagesMap.values());
  }

  async getSyncedImageByFileId(fileId: string): Promise<SyncedImage | undefined> {
    return Array.from(this.syncedImagesMap.values()).find(s => s.fileId === fileId);
  }

  async createSyncedImage(data: Omit<SyncedImage, 'id'>): Promise<SyncedImage> {
    const id = this.currentIds.syncedImages++;
    const synced = { ...data, id };
    this.syncedImagesMap.set(id, synced);
    return synced;
  }
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getProducts(categoryId?: number, isPopular?: boolean): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (categoryId) {
      // @ts-ignore
      query = query.where(eq(products.categoryId, categoryId));
    }
    
    if (isPopular) {
      // @ts-ignore
      query = query.where(eq(products.isPopular, true));
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getDeliveryLocations(): Promise<DeliveryLocation[]> {
    return await db.select().from(deliveryLocations);
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async createDeliveryLocation(data: Omit<DeliveryLocation, 'id'>): Promise<DeliveryLocation> {
    const [location] = await db.insert(deliveryLocations).values(data).returning();
    return location;
  }

  async updateProductPrice(id: number, price?: number, unitType?: string, name?: string): Promise<Product | undefined> {
    const updateData: { price?: number; unitType?: string; name?: string } = {};
    if (price !== undefined) updateData.price = price;
    if (unitType) updateData.unitType = unitType;
    if (name) updateData.name = name;
    
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async deleteDeliveryLocation(id: number): Promise<boolean> {
    const result = await db.delete(deliveryLocations).where(eq(deliveryLocations.id, id)).returning();
    return result.length > 0;
  }

  async seedCategories(data: any[]): Promise<void> {
    if ((await this.getCategories()).length === 0) {
      await db.insert(categories).values(data);
    }
  }

  async seedProducts(data: any[]): Promise<void> {
    if ((await this.getProducts()).length === 0) {
      await db.insert(products).values(data);
    }
  }

  async getSyncedImages(): Promise<SyncedImage[]> {
    return await db.select().from(syncedImages);
  }

  async getSyncedImageByFileId(fileId: string): Promise<SyncedImage | undefined> {
    const [synced] = await db.select().from(syncedImages).where(eq(syncedImages.fileId, fileId));
    return synced;
  }

  async createSyncedImage(data: Omit<SyncedImage, 'id'>): Promise<SyncedImage> {
    const [synced] = await db.insert(syncedImages).values(data).returning();
    return synced;
  }
}

let storage: IStorage;

async function checkDatabase() {
  if (!process.env.DATABASE_URL) return false;
  try {
    // Try a simple query to see if tables exist
    await db.select().from(categories).limit(1);
    return true;
  } catch (e) {
    console.error("Database connection failed or tables missing, falling back to memory storage:", e);
    return false;
  }
}

// Initial storage assignment, will be updated in registerRoutes if needed
storage = new MemStorage();

export async function initializeStorage() {
  const isDbAvailable = await checkDatabase();
  if (isDbAvailable) {
    storage = new DatabaseStorage();
  } else {
    storage = new MemStorage();
  }
  return storage;
}

export { storage };
