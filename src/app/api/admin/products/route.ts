import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const variantSchema = z.object({ size: z.string().min(1), stock: z.number().int().min(0) });

const productSchema = z.object({
  sku: z.string().min(1).max(60),
  name: z.string().min(1).max(200),
  categoryId: z.number().int().nullable().optional(),
  collectionId: z.number().int().nullable().optional(),
  price: z.number().nonnegative(),
  description: z.string().optional().default(""),
  material: z.string().optional().default(""),
  careInstructions: z.string().optional().default(""),
  deliveryEstimate: z.string().optional().default(""),
  colors: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional().default("") })).default([]),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  allowCustomRequest: z.boolean().default(true),
  variants: z.array(variantSchema).min(1),
});

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
}

export async function GET() {
  const rows = await db.query.products.findMany({
    with: { variants: true, category: true, collection: true },
    orderBy: [desc(products.createdAt)],
  });
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  try {
    const product = await db.transaction(async (tx) => {
      const [row] = await tx.insert(products).values({
        sku: data.sku,
        name: data.name,
        slug: slugify(data.name),
        categoryId: data.categoryId ?? null,
        collectionId: data.collectionId ?? null,
        price: String(data.price),
        description: data.description,
        material: data.material,
        careInstructions: data.careInstructions,
        deliveryEstimate: data.deliveryEstimate,
        colors: data.colors,
        images: data.images,
        isNewArrival: data.isNewArrival,
        isBestSeller: data.isBestSeller,
        allowCustomRequest: data.allowCustomRequest,
      }).returning();

      await tx.insert(productVariants).values(data.variants.map((v) => ({ productId: row.id, size: v.size, stock: v.stock })));
      return row;
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") return NextResponse.json({ error: "A product with that SKU already exists." }, { status: 409 });
    console.error("Product create failed:", err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
