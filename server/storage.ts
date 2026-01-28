import { db } from "./db";
import {
  categories,
  products,
  deliveryLocations,
  type Category,
  type Product,
  type DeliveryLocation,
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
  
  updateProductPrice(id: number, price: number, unitType?: string): Promise<Product | undefined>;
  deleteDeliveryLocation(id: number): Promise<boolean>;
  
  seedCategories(data: any[]): Promise<void>;
  seedProducts(data: any[]): Promise<void>;
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

  async updateProductPrice(id: number, price: number, unitType?: string): Promise<Product | undefined> {
    const updateData: { price: number; unitType?: string } = { price };
    if (unitType) {
      updateData.unitType = unitType;
    }
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product;
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
}

export const storage = new DatabaseStorage();
