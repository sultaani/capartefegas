"use client";

import { useState } from "react";
import { AlertCircle, Minus, Plus, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useCart } from "./CartProvider";
import { COLOR_HEX, CUSTOM_REQUEST_TYPES } from "@/lib/colors";
import type { Product } from "@/lib/types";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(product.colors[0] || "");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [customType, setCustomType] = useState("None");
  const [customNote, setCustomNote] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const images =
    product.images.length > 0
      ? product.images
      : [{ url: "https://picsum.photos/seed/cpt-placeholder/800/1000", publicId: "" }];

  const selectedVariant = product.variants.find((v) => v.size === size);
  const maxQty = selectedVariant ? selectedVariant.stock : 99;

  function handleAdd() {
    if (!size || !selectedVariant) return;
    addItem({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      price: Number(product.price),
      image: images[0].url,
      color,
      size,
      quantity: qty,
      maxStock: selectedVariant.stock,
      customRequestType: customType,
      customRequestNote: customType !== "None" ? customNote : "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function prev() {
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setImgIdx((i) => (i + 1) % images.length);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* Image gallery */}
        <div>
          <div
            className="relative aspect-[4/5] bg-neutral-100 overflow-hidden group cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[imgIdx].url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            />
            <div className="absolute top-3 right-3 bg-white/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Dot indicators for mobile */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Thumbnail strip — hidden on very small screens */}
          {images.length > 1 && (
            <div className="hidden sm:flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-14 h-18 overflow-hidden border cursor-pointer ${
                    imgIdx === i ? "border-neutral-900" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ height: "4.5rem" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="font-mono text-xs text-neutral-400 tracking-wide">{product.sku}</div>
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold mt-1">
            {product.name}
          </h1>
          <div className="text-lg mt-2">{formatNaira(Number(product.price))}</div>
          <p className="text-sm text-neutral-600 mt-4 leading-relaxed">{product.description}</p>

          {/* Color picker */}
          <div className="mt-5">
            <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-2">
              Color — {color}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                    color === c ? "border-neutral-900 scale-110" : "border-neutral-200"
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c] || "#999999" }}
                />
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="mt-5">
            <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-2">
              Size{size ? ` — ${size}` : ""}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  disabled={v.stock === 0}
                  onClick={() => { setSize(v.size); setQty(1); }}
                  className={`min-w-[3rem] px-3 h-10 text-sm border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                    size === v.size
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
              <div className="flex items-center gap-1 text-xs text-amber-800 mt-2">
                <AlertCircle className="w-3 h-3" /> Only {selectedVariant.stock} left in this size
              </div>
            )}
            {!size && (
              <div className="text-xs text-neutral-400 mt-2">Select a size to continue</div>
            )}
          </div>

          {/* Custom request */}
          {product.allowCustomRequest && (
            <div className="mt-5">
              <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-2">
                Customize (optional)
              </div>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 text-sm cursor-pointer"
              >
                {CUSTOM_REQUEST_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {customType !== "None" && (
                <div className="mt-2">
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value.slice(0, 500))}
                    maxLength={500}
                    placeholder="Describe what you'd like changed."
                    className="w-full border border-neutral-300 px-3 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <div className="text-[11px] text-neutral-400 text-right">{customNote.length}/500</div>
                </div>
              )}
            </div>
          )}

          {/* Quantity + Add to bag */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center border border-neutral-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3 py-2.5 cursor-pointer hover:bg-neutral-50"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 text-sm min-w-[2.5rem] text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                aria-label="Increase quantity"
                className="px-3 py-2.5 cursor-pointer hover:bg-neutral-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {size && qty >= maxQty && (
              <div className="text-xs text-neutral-400">Max: {maxQty}</div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!size}
            className="w-full mt-4 px-6 py-4 sm:py-3 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {added ? "✓ Added to Bag" : !size ? "Select a Size" : "Add to Bag"}
          </button>

          {/* Product details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs text-neutral-500 border-t border-neutral-200 pt-4">
            {product.material && (
              <div><span className="text-neutral-900">Material:</span> {product.material}</div>
            )}
            {product.deliveryEstimate && (
              <div><span className="text-neutral-900">Delivery:</span> {product.deliveryEstimate}</div>
            )}
            {product.careInstructions && (
              <div className="sm:col-span-2">
                <span className="text-neutral-900">Care:</span> {product.careInstructions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white cursor-pointer p-2"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ✕
          </button>
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 text-white cursor-pointer p-3"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[imgIdx].url}
            alt={product.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 text-white cursor-pointer p-3"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
