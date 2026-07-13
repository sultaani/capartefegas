import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { rateLimit, getClientIP, LIMITS } from "@/lib/rate-limit";
const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(256) });
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`adminLogin:${ip}`, LIMITS.adminLogin.limit, LIMITS.adminLogin.windowMs);
  if (!rl.allowed) return NextResponse.json({ error:"Too many login attempts. Please wait." },
    { status:429, headers:{ "Retry-After": String(Math.ceil(rl.retryAfterMs/1000)) } });
  const body = await request.json().catch(()=>null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error:"Email and password are required." },{ status:400 });
  const admin = await db.query.adminUsers.findFirst({ where: eq(adminUsers.email, parsed.data.email.toLowerCase().trim()) });
  const hash = admin?.passwordHash ?? "$2a$10$dummydummydummydummydumm.dummydummydummydummydummydum";
  const valid = await verifyPassword(parsed.data.password, hash);
  if (!admin || !valid) return NextResponse.json({ error:"Invalid email or password." },{ status:401 });
  await createSessionCookie({ adminId:admin.id, email:admin.email });
  return NextResponse.json({ ok:true, admin:{ id:admin.id, email:admin.email, name:admin.name } });
}
