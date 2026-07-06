import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { collections, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

const schema = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  coverImagePublicId: z.string().optional(),
  featuredOnHomepage: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const [row] = await db
    .update(collections)
    .set(parsed.data)
    .where(eq(collections.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await db.query.collections.findFirst({ where: eq(collections.id, Number(id)) });
  if (existing?.coverImagePublicId) {
    await deleteCloudinaryImage(existing.coverImagePublicId);
  }
  await db.update(products).set({ collectionId: null }).where(eq(products.collectionId, Number(id)));
  await db.delete(collections).where(eq(collections.id, Number(id)));
  return NextResponse.json({ ok: true });
}
