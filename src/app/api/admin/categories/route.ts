import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
const schema = z.object({ name:z.string().min(1).max(120), isActive:z.boolean().default(true), sortOrder:z.number().int().default(0) });
export async function GET() {
  return NextResponse.json(await db.query.categories.findMany({ orderBy:[asc(categories.sortOrder)] }));
}
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ error:"Invalid data" },{ status:400 });
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  try {
    const [row] = await db.insert(categories).values({...parsed.data,slug}).returning();
    return NextResponse.json(row,{ status:201 });
  } catch (e:any) {
    if (e?.code==="23505") return NextResponse.json({ error:"Category already exists." },{ status:409 });
    return NextResponse.json({ error:"Failed to create category." },{ status:500 });
  }
}
