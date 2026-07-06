import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const schema = z.object({
  siteName: z.string().min(1).optional(),
  accentColor: z.string().optional(),
  whatsappNumber: z.string().min(7).optional(),
  contactEmail: z.string().email().or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  instagramHandle: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  heroEyebrow: z.string().optional(),
  heroHeadline: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroCtaPrimary: z.string().optional(),
  heroCtaSecondary: z.string().optional(),
  promoEyebrow: z.string().optional(),
  promoHeadline: z.string().optional(),
  promoSubtext: z.string().optional(),
  promoImageUrl: z.string().optional(),
});

export async function GET() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings data", details: parsed.error.flatten() }, { status: 400 });

  const [row] = await db.update(siteSettings).set(parsed.data).where(eq(siteSettings.id, 1)).returning();
  return NextResponse.json(row);
}
