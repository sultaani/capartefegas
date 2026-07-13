import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { rateLimit, getClientIP, LIMITS } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const schema = z.object({ name:z.string().min(1).max(160).trim(), email:z.string().email().trim(), subject:z.string().max(200).trim().default(""), body:z.string().min(1).max(2000).trim() });
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`contact:${ip}`, LIMITS.contact.limit, LIMITS.contact.windowMs);
  if (!rl.allowed) return NextResponse.json({ error:"Too many messages. Please wait." },{ status:429 });
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ error:"Fill in all required fields." },{ status:400 });
  await db.insert(contactMessages).values(parsed.data);
  return NextResponse.json({ ok:true });
}
