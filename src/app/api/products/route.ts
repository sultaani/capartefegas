import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category");

  const rows = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { variants: true, category: true, collection: true },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const filtered = categorySlug
    ? rows.filter((p) => p.category?.slug === categorySlug)
    : rows;

  return NextResponse.json(filtered);
}
