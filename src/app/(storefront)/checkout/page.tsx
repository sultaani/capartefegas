"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

const INPUT =
  "w-full border border-neutral-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [rates, setRates] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", city: "", state: "Lagos", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);

  useEffect(() => {
    fetch("/api/shipping-rates")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => {});
  }, []);

  const shippingFee = rates[form.state] ?? rates["Other"] ?? 0;
  const total = subtotal + shippingFee;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((it) => ({
            productId: it.productId,
            color: it.color,
            size: it.size,
            quantity: it.quantity,
            customRequestType: it.customRequestType,
            customRequestNote: it.customRequestNote,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      setResult({ orderNumber: data.order.orderNumber, whatsappUrl: data.whatsappUrl });
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // ── Confirmation screen ────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-white" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold">Order Created</div>
          <div className="font-mono text-sm text-neutral-500 mt-2 tracking-wide">
            {result.orderNumber}
          </div>
          <p className="text-sm text-neutral-600 mt-4 leading-relaxed max-w-sm mx-auto">
            Your order is recorded as <span className="font-medium">Pending</span>. Tap
            the button below to send your order details to us on WhatsApp and confirm.
          </p>
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-6 px-6 py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 transition-colors"
          >
            Continue to WhatsApp
          </a>
          <div className="text-xs text-neutral-400 mt-3 max-w-xs mx-auto">
            If WhatsApp doesn&apos;t open automatically, quote your order number when
            you message us.
          </div>
          <Link href="/" className="block text-sm underline mt-8 text-neutral-500">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
        <div>
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
          <p className="text-neutral-500 text-sm">Your bag is empty.</p>
          <Link href="/catalogue" className="text-sm underline mt-3 block">
            Browse catalogue
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Form ── */}
        <form onSubmit={submit} className="lg:col-span-3 flex flex-col gap-4">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-1">
            Contact &amp; Delivery
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={INPUT}
            />
            <input
              required
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={INPUT}
            />
          </div>
          <input
            required
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={INPUT}
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={INPUT}
          />
          <input
            required
            placeholder="Delivery address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={INPUT}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className={INPUT}
            >
              {Object.keys(rates).length > 0
                ? Object.keys(rates).map((s) => (
                    <option key={s}>{s}</option>
                  ))
                : <option>{form.state}</option>}
            </select>
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={INPUT}
            />
          </div>
          <textarea
            placeholder="Additional notes (optional)"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className={`${INPUT} h-20`}
          />

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 disabled:bg-neutral-300 cursor-pointer transition-colors mt-2"
          >
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
          <div className="text-xs text-neutral-400 text-center">
            You&apos;ll confirm final details with us on WhatsApp. No payment is
            collected on this page.
          </div>
        </form>

        {/* ── Order summary ── */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-50 border border-neutral-200 p-5 sticky top-20">
            <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-4">
              Order Summary
            </div>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-tight">{item.name}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {item.color} / {item.size} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-xs font-medium shrink-0">
                    {formatNaira(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 mt-4 pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping ({form.state})</span>
                <span>{shippingFee > 0 ? formatNaira(shippingFee) : "—"}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-neutral-200 pt-2 mt-1">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
