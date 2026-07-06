"use client";

import Link from "next/link";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={closeCart} />
      {/* Full screen on mobile, capped at md on larger screens */}
      <div className="relative w-full sm:max-w-md bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-neutral-200 shrink-0">
          <div className="font-heading font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Bag
            {cart.length > 0 && (
              <span className="font-mono text-sm text-neutral-500">({cart.length})</span>
            )}
          </div>
          <button onClick={closeCart} aria-label="Close bag" className="cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-5">
          {cart.length === 0 && (
            <div className="text-center text-neutral-500 mt-20">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-neutral-200" />
              <p className="text-sm">Your bag is empty.</p>
              <button onClick={closeCart} className="mt-3 text-sm underline cursor-pointer">
                Continue shopping
              </button>
            </div>
          )}
          {cart.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-24 sm:w-24 sm:h-28 object-cover bg-neutral-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{item.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {item.color} / {item.size}
                </div>
                {item.customRequestType !== "None" && (
                  <div className="text-xs text-amber-800 mt-0.5 truncate">
                    {item.customRequestType}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() => updateQuantity(idx, -1)}
                      aria-label="Decrease"
                      className="px-2.5 py-1.5 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, 1)}
                      aria-label="Increase"
                      className="px-2.5 py-1.5 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-medium">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(idx)}
                aria-label="Remove item"
                className="text-neutral-300 hover:text-neutral-900 self-start cursor-pointer p-1 mt-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-5 py-4 border-t border-neutral-200 shrink-0 bg-white">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal</span>
              <span className="font-medium">{formatNaira(subtotal)}</span>
            </div>
            <div className="text-xs text-neutral-400 mb-4">
              Shipping calculated at checkout.
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block text-center px-6 py-4 sm:py-3 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 active:bg-amber-900 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
