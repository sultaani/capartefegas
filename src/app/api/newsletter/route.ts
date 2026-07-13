import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { rateLimit, getClientIP, LIMITS } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const schema = z.object({ email: z.string().email().max(255).trim().toLowerCase() });
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`newsletter:${ip}`, LIMITS.newsletter.limit, LIMITS.newsletter.windowMs);
  if (!rl.allowed) return NextResponse.json({ error:"Too many requests." },{ status:429 });
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ error:"Enter a valid email." },{ status:400 });
  await db.insert(newsletterSubscribers).values({ email:parsed.data.email }).onConflictDoNothing();
  return NextResponse.json({ ok:true });
}
