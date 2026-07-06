"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "./CartProvider";

const LINKS = [
  ["/", "Home"],
  ["/catalogue", "Catalogue"],
  ["/collections", "Collections"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function Navbar({ siteName }: { siteName: string }) {
  const { cart, openCart } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/catalogue?search=${encodeURIComponent(query)}`);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-heading text-base sm:text-lg font-bold tracking-tight shrink-0">
          {siteName.toUpperCase()}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="text-sm uppercase tracking-wide text-neutral-600 hover:text-neutral-900 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Search"
            className="cursor-pointer p-1"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={openCart}
            aria-label={`Cart${cart.length > 0 ? `, ${cart.length} items` : ""}`}
            className="relative cursor-pointer p-1"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="md:hidden cursor-pointer p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inline search bar */}
      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="border-t border-neutral-200 bg-white px-4 sm:px-5 py-3"
        >
          <div className="max-w-6xl mx-auto flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="px-3 border border-neutral-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200">
            <div className="font-heading font-bold">{siteName.toUpperCase()}</div>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="cursor-pointer p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col divide-y divide-neutral-100">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-4 font-heading text-xl"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
