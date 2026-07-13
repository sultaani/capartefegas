/**
 * OPay Checkout — Nigeria. Amounts in KOBO (₦1 = 100 kobo).
 * Env: OPAY_MERCHANT_ID, OPAY_PRIVATE_KEY, OPAY_PUBLIC_KEY
 *      OPAY_BASE_URL (sandbox: https://sandboxapi.opaycheckout.com)
 *                    (live:    https://api.opaycheckout.com)
 */
import crypto from "crypto";
const BASE = process.env.OPAY_BASE_URL || "https://sandboxapi.opaycheckout.com";
const MID  = process.env.OPAY_MERCHANT_ID || "";
const KEY  = process.env.OPAY_PRIVATE_KEY || "";
function sign(p:string){return crypto.createHmac("sha512",KEY).update(p).digest("base64");}
function hdrs(p:string){return {"Content-Type":"application/json",Authorization:`Bearer ${sign(p)}`,MerchantId:MID};}
export async function initiatePayment(i:{reference:string;amountKobo:number;customerName:string;customerEmail:string;customerPhone:string;returnUrl:string;callbackUrl:string;description:string}) {
  if(!MID||!KEY) throw new Error("OPay credentials not set in .env");
  const b=JSON.stringify({amount:{total:String(i.amountKobo),currency:"NGN"},callbackUrl:i.callbackUrl,cancelUrl:i.returnUrl.replace("/payment/verify","").split("?")[0],country:"NG",currency:"NGN",payMethods:["BankCard","Wallet","QRCode","Transfer"],product:{description:i.description,name:"Capartefegas Order"},reference:i.reference,returnUrl:i.returnUrl,userInfo:{userId:`guest-${i.reference}`,userName:i.customerName,userEmail:i.customerEmail,userMobile:i.customerPhone}});
  const r=await fetch(`${BASE}/api/v1/international/payment/create`,{method:"POST",headers:hdrs(b),body:b});
  const d=await r.json();
  if(d.code!=="00000") throw new Error(`OPay: ${d.message}`);
  return {cashierUrl:d.data.cashierUrl,reference:d.data.reference};
}
export async function queryPayment(reference:string) {
  if(!MID||!KEY) throw new Error("OPay credentials not set in .env");
  const b=JSON.stringify({reference,country:"NG"});
  const r=await fetch(`${BASE}/api/v1/international/payment/query`,{method:"POST",headers:hdrs(b),body:b});
  const d=await r.json();
  if(d.code!=="00000") throw new Error(`OPay: ${d.message}`);
  return {status:d.data.status as "INITIAL"|"PENDING"|"SUCCESS"|"FAIL"|"CLOSE",amountKobo:Number(d.data.amount?.total||0)};
}
export function verifyWebhookSignature(rawBody:string,authHeader:string):boolean {
  if(!KEY) return false;
  try { return crypto.timingSafeEqual(Buffer.from(sign(rawBody),"base64"),Buffer.from(authHeader.replace(/^Bearer\s+/i,"").trim(),"base64")); }
  catch { return false; }
}
export const nairaToKobo = (n:number) => Math.round(n*100);
