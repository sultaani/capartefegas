import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
const schema = z.object({ name:z.string().min(1).max(120).optional(), isActive:z.boolean().optional(), sortOrder:z.number().int().optional() });
export async function PATCH(request: NextRequest, { params }:{ params:Promise<{id:string}> }) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ error:"Invalid data" },{ status:400 });
  const [row] = await db.update(categories).set(parsed.data).where(eq(categories.id,Number(id))).returning();
  if (!row) return NextResponse.json({ error:"Not found" },{ status:404 });
  return NextResponse.json(row);
}
export async function DELETE(_req: NextRequest, { params }:{ params:Promise<{id:string}> }) {
  const { id } = await params;
  await db.update(products).set({ categoryId:null }).where(eq(products.categoryId,Number(id)));
  await db.delete(categories).where(eq(categories.id,Number(id)));
  return NextResponse.json({ ok:true });
}
