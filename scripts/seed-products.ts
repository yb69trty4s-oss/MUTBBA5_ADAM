import ImageKit from "imagekit";
import { db } from "../server/db";
import { categories, products } from "../shared/schema";
import fs from "fs";
import path from "path";

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (!privateKey || !publicKey || !urlEndpoint) {
  console.error("ImageKit not configured. Please set IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_URL_ENDPOINT");
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

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

async function uploadImage(localPath: string, fileName: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  const base64File = fileBuffer.toString("base64");
  
  const response = await imagekit.upload({
    file: base64File,
    fileName: fileName,
    folder: "/products",
  });
  
  return response.url;
}

async function seed() {
  console.log("Starting product seeding...");
  
  const existingCategories = await db.select().from(categories);
  let categoryId: number;
  
  if (existingCategories.length === 0) {
    console.log("Creating appetizers category...");
    const categoryImagePath = "generated_images/sambousa_meat.png";
    const categoryImageUrl = await uploadImage(categoryImagePath, "appetizers-category.png");
    
    const [newCategory] = await db.insert(categories).values({
      name: "مقبلات",
      slug: "appetizers",
      image: categoryImageUrl,
    }).returning();
    
    categoryId = newCategory.id;
    console.log(`Created category: ${newCategory.name} (ID: ${categoryId})`);
  } else {
    categoryId = existingCategories[0].id;
    console.log(`Using existing category ID: ${categoryId}`);
  }
  
  console.log("Uploading images and creating products...");
  
  for (const product of productsList) {
    try {
      console.log(`Processing: ${product.name}`);
      
      const fileName = path.basename(product.imagePath, ".png") + "-" + Date.now() + ".png";
      const imageUrl = await uploadImage(product.imagePath, fileName);
      
      const [newProduct] = await db.insert(products).values({
        categoryId: categoryId,
        name: product.name,
        description: product.description,
        price: 100,
        unitType: "حبة",
        image: imageUrl,
        isPopular: false,
      }).returning();
      
      console.log(`Created product: ${newProduct.name} (ID: ${newProduct.id})`);
    } catch (error) {
      console.error(`Failed to create product ${product.name}:`, error);
    }
  }
  
  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
