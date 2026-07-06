import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

const schema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  coverImagePublicId: z.string().optional().default(""),
  featuredOnHomepage: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const rows = await db.query.collections.findMany({ orderBy: [asc(collections.sortOrder)] });
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid collection data" }, { status: 400 });

  try {
    const [row] = await db.insert(collections).values({ ...parsed.data, slug: slugify(parsed.data.name) }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") return NextResponse.json({ error: "A collection with that name already exists." }, { status: 409 });
    return NextResponse.json({ error: "Failed to create collection." }, { status: 500 });
  }
}
