"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const params = useSearchParams();
  const reference = params.get("reference");
  const [state, setState] = useState<"loading"|"success"|"failed"|"error">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!reference) { setState("error"); return; }
    async function check() {
      try {
        const res = await fetch(`/api/payment/verify/${encodeURIComponent(reference!)}`,{ cache:"no-store" });
        const d = await res.json();
        if (!res.ok) { setState("error"); return; }
        setData(d);
        if (d.order.paymentStatus === "paid") setState("success");
        else if (d.order.paymentStatus === "failed" || d.order.status === "cancelled") setState("failed");
        else {
          // Poll once more after 3s for slow webhooks
          setTimeout(async () => {
            const r2 = await fetch(`/api/payment/verify/${encodeURIComponent(reference!)}`,{ cache:"no-store" }).then(r=>r.json()).catch(()=>null);
            if (r2?.order?.paymentStatus === "paid") { setData(r2); setState("success"); }
            else setState("error");
          }, 3000);
        }
      } catch { setState("error"); }
    }
    check();
  }, [reference]);

  if (state === "loading") return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-neutral-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm">Verifying your payment…</p>
    </div>
  );

  if (state === "success") return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="font-heading text-2xl sm:text-3xl font-bold">Payment Successful!</div>
        <div className="font-mono text-sm text-neutral-500 mt-2 tracking-wide">{data?.order?.orderNumber}</div>
        <p className="text-sm text-neutral-600 mt-4 max-w-sm mx-auto">Your payment was received. Tap below to confirm your order on WhatsApp so we can arrange delivery.</p>
        <a href={data?.whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="block mt-6 px-6 py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 transition-colors">
          Confirm on WhatsApp
        </a>
        <Link href="/" className="block text-sm underline mt-8 text-neutral-500">Back to Home</Link>
      </div>
    </div>
  );

  if (state === "failed") return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="font-heading text-2xl font-bold">Payment Unsuccessful</div>
        <p className="text-sm text-neutral-600 mt-4 max-w-sm mx-auto">No charge was made. You can try again or place a WhatsApp order instead.</p>
        <Link href="/checkout" className="block mt-6 px-6 py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 transition-colors">Try Again</Link>
        <Link href="/" className="block text-sm underline mt-5 text-neutral-500">Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="font-heading text-xl font-bold">Unable to verify payment</div>
        <p className="text-sm text-neutral-600 mt-3">If you completed the payment, please contact us on WhatsApp with your order reference and we&apos;ll sort it out.</p>
        <Link href="/contact" className="block mt-5 px-6 py-3 border border-neutral-900 text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-colors">Contact Us</Link>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-300" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
