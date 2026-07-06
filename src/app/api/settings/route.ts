import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Public-facing site settings: branding, SEO, contact details, and the
// WhatsApp business number the checkout redirect uses. None of this is
// sensitive — it's the same contact info shown in the footer.
export async function GET() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  return NextResponse.json(settings);
}
