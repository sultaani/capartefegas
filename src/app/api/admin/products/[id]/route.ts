import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

const variantSchema = z.object({ size: z.string().min(1), stock: z.number().int().min(0) });

const updateSchema = z.object({
  sku: z.string().min(1).max(60).optional(),
  name: z.string().min(1).max(200).optional(),
  categoryId: z.number().int().nullable().optional(),
  collectionId: z.number().int().nullable().optional(),
  price: z.number().nonnegative().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  deliveryEstimate: z.string().optional(),
  colors: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional().default("") })).optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  allowCustomRequest: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.id, Number(id)),
    with: { variants: true, category: true, collection: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  try {
    const updated = await db.transaction(async (tx) => {
      const { variants, price, ...rest } = data;
      const [row] = await tx.update(products)
        .set({ ...rest, ...(price !== undefined ? { price: String(price) } : {}), updatedAt: new Date() })
        .where(eq(products.id, productId))
        .returning();

      if (!row) throw new Error("NOT_FOUND");

      if (variants) {
        for (const v of variants) {
          await tx.insert(productVariants)
            .values({ productId, size: v.size, stock: v.stock })
            .onConflictDoUpdate({ target: [productVariants.productId, productVariants.size], set: { stock: v.stock } });
        }
      }
      return row;
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.message === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (err?.code === "23505") return NextResponse.json({ error: "A product with that SKU already exists." }, { status: 409 });
    console.error("Product update failed:", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

// Soft delete — keeps the product row (and its order history) intact but
// hides it from the storefront, matching the warning shown in the admin UI.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.id, Number(id)) });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(products).set({ isActive: false }).where(eq(products.id, Number(id)));

  for (const img of product.images as { url: string; publicId: string }[]) {
    if (img.publicId) await deleteCloudinaryImage(img.publicId);
  }

  return NextResponse.json({ ok: true });
}
