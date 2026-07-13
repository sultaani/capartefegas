import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const body = await request.json().catch(()=>({}));
  const { POST: handler } = await import("../payment/initiate/route");
  return handler(new NextRequest(new URL("/api/payment/initiate", request.url), { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...body, paymentMethod:body.paymentMethod??"whatsapp"}) }));
}
