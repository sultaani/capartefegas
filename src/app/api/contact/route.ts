import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email(),
  subject: z.string().max(200).optional().default(""),
  body: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });

  await db.insert(contactMessages).values(parsed.data);
  return NextResponse.json({ ok: true });
}
