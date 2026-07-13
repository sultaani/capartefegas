"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag, CreditCard, MessageCircle, Info } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";

function fmt(n:number){ return "₦"+Math.round(n).toLocaleString("en-NG"); }
const INP = "w-full border border-neutral-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [rates, setRates] = useState<Record<string,number>>({});
  const [form, setForm] = useState({ firstName:"", lastName:"", phone:"", email:"", address:"", city:"", state:"Lagos", notes:"" });
  const [method, setMethod] = useState<"whatsapp"|"opay">("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [done, setDone] = useState<{orderNumber:string;whatsappUrl:string}|null>(null);

  useEffect(() => { fetch("/api/shipping-rates").then(r=>r.json()).then(setRates).catch(()=>{}); },[]);

  const shippingFee = rates[form.state] ?? rates["Other"] ?? 0;
  const total = subtotal + shippingFee;
  function upd(f:string,v:string){ setForm(p=>({...p,[f]:v})); }

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/payment/initiate",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...form, items:cart.map(i=>({productId:i.productId,color:i.color,size:i.size,quantity:i.quantity,customRequestType:i.customRequestType,customRequestNote:i.customRequestNote})), paymentMethod:method }) });
      const data = await res.json();
      if (!res.ok){ setError(data.error||"Something went wrong."); setSubmitting(false); return; }
      clearCart();
      if (method==="opay" && data.cashierUrl){ window.location.href = data.cashierUrl; return; }
      setDone({ orderNumber:data.order.orderNumber, whatsappUrl:data.whatsappUrl });
    } catch { setError("Network error — please try again."); setSubmitting(false); }
  }

  if (done) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-5"><Check className="w-7 h-7 text-white"/></div>
        <div className="font-heading text-2xl font-bold">Order Created</div>
        <div className="font-mono text-sm text-neutral-500 mt-2">{done.orderNumber}</div>
        <p className="text-sm text-neutral-600 mt-4 max-w-sm mx-auto">Your order is <span className="font-medium">Pending</span>. Tap below to send your details to us on WhatsApp and confirm.</p>
        <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-6 px-6 py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 transition-colors">Continue to WhatsApp</a>
        <Link href="/" className="block text-sm underline mt-8 text-neutral-500">Back to Home</Link>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <div><ShoppingBag className="w-10 h-10 mx-auto mb-3 text-neutral-200"/><p className="text-neutral-500 text-sm">Your bag is empty.</p><Link href="/catalogue" className="text-sm underline mt-3 block">Browse catalogue</Link></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={submit} className="lg:col-span-3 flex flex-col gap-4">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-1">Contact &amp; Delivery</div>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First name" value={form.firstName} onChange={e=>upd("firstName",e.target.value)} className={INP}/>
            <input required placeholder="Last name"  value={form.lastName}  onChange={e=>upd("lastName",e.target.value)}  className={INP}/>
          </div>
          <input required type="tel"   placeholder="Phone number"     value={form.phone}   onChange={e=>upd("phone",e.target.value)}   className={INP}/>
          <input required type="email" placeholder="Email address"    value={form.email}   onChange={e=>upd("email",e.target.value)}   className={INP}/>
          <input required               placeholder="Delivery address" value={form.address} onChange={e=>upd("address",e.target.value)} className={INP}/>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.state} onChange={e=>upd("state",e.target.value)} className={INP}>
              {NIGERIAN_STATES.map(s=><option key={s}>{s}</option>)}
            </select>
            <input required placeholder="City / Area" value={form.city} onChange={e=>upd("city",e.target.value)} className={INP}/>
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={e=>upd("notes",e.target.value)} className={`${INP} h-20`}/>

          <div className="mt-1">
            <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Payment Method</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([["opay","Pay Online","Card, transfer, wallet via OPay",CreditCard],["whatsapp","WhatsApp Order","Pay on delivery or via bank transfer",MessageCircle]] as const).map(([val,label,sub,Icon])=>(
                <button key={val} type="button" onClick={()=>setMethod(val as any)}
                  className={`relative flex items-start gap-3 p-4 border-2 text-left cursor-pointer transition-colors ${method===val?"border-neutral-900 bg-neutral-50":"border-neutral-200 hover:border-neutral-400"}`}>
                  <Icon className="w-5 h-5 shrink-0 mt-0.5"/>
                  <div><div className="text-sm font-medium">{label}</div><div className="text-xs text-neutral-500 mt-0.5">{sub}</div></div>
                  {method===val && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white"/></div>}
                </button>
              ))}
            </div>
            {method==="opay" && (
              <div className="flex gap-2 mt-3 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 px-3 py-2.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
                <span>You&apos;ll be redirected to OPay to pay securely. After payment you&apos;ll return here and can confirm delivery on WhatsApp.</span>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 disabled:bg-neutral-300 cursor-pointer transition-colors mt-2">
            {submitting ? (method==="opay"?"Redirecting…":"Placing Order…") : method==="opay" ? `Pay ${fmt(total)} via OPay` : "Place WhatsApp Order"}
          </button>
          <div className="text-xs text-neutral-400 text-center">
            {method==="opay"?"All payments processed securely by OPay. Nothing is stored on this site.":"No payment collected here — you'll arrange payment on WhatsApp."}
          </div>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-neutral-50 border border-neutral-200 p-5 sticky top-20">
            <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-4">Order Summary</div>
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
              {cart.map((item,i)=>(
                <div key={i} className="flex gap-3 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover bg-neutral-100 shrink-0"/>
                  <div className="flex-1 min-w-0"><div className="text-xs leading-tight">{item.name}</div><div className="text-xs text-neutral-400 mt-0.5">{item.color}/{item.size} ×{item.quantity}</div></div>
                  <div className="text-xs font-medium shrink-0">{fmt(item.price*item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 mt-4 pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-neutral-500"><span>Shipping ({form.state})</span><span>{shippingFee>0?fmt(shippingFee):"—"}</span></div>
              <div className="flex justify-between font-bold border-t border-neutral-200 pt-2 mt-1"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
