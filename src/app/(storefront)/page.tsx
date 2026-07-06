import Link from "next/link";
import { db } from "@/lib/db";
import { products, collections, siteSettings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SectionLabel } from "@/components/storefront/SectionLabel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  const allProducts = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { variants: true, category: true, collection: true },
    orderBy: [desc(products.createdAt)],
  });
  const featuredCollections = await db.query.collections.findMany({
    where: eq(collections.featuredOnHomepage, true),
  });

  const newArrivals = allProducts.filter((p) => p.isNewArrival).slice(0, 8);
  const bestSellers = allProducts.filter((p) => p.isBestSeller).slice(0, 8);

  const heroImg = settings?.heroImageUrl || "https://picsum.photos/seed/cpt-hero/1600/1200";
  const promoImg = settings?.promoImageUrl || "https://picsum.photos/seed/cpt-promo/1600/800";

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative h-[75vh] sm:h-[80vh] min-h-[420px] bg-neutral-900 text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-5 flex flex-col justify-end pb-10 sm:pb-16">
          {settings?.heroEyebrow && (
            <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-3">
              {settings.heroEyebrow}
            </span>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.05] max-w-xs sm:max-w-xl">
            {settings?.heroHeadline || "Explore New Horizons."}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
            <Link
              href="/collections"
              className="px-6 py-3.5 sm:py-3 bg-white text-neutral-900 text-sm uppercase tracking-wide hover:bg-amber-700 hover:text-white text-center transition-colors"
            >
              {settings?.heroCtaPrimary || "Explore Collection"}
            </Link>
            <Link
              href="/catalogue"
              className="px-6 py-3.5 sm:py-3 border border-white text-white text-sm uppercase tracking-wide hover:bg-white hover:text-neutral-900 text-center transition-colors"
            >
              {settings?.heroCtaSecondary || "Shop Catalogue"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Collections ── */}
      {featuredCollections.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-12 sm:py-16">
          <SectionLabel>Featured Collections</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {featuredCollections.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.coverImageUrl || ""}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 motion-reduce:transform-none transition-transform duration-500"
                  />
                </div>
                <div className="font-heading font-bold mt-3">{c.name}</div>
                <div className="text-sm text-neutral-500">{c.description}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-12 sm:py-16 border-t border-neutral-200">
          <div className="flex items-baseline justify-between mb-4 sm:mb-0">
            <SectionLabel>New Arrivals</SectionLabel>
            <Link href="/catalogue?category=All" className="text-xs underline text-neutral-500 sm:hidden">
              See all
            </Link>
          </div>
          {/* 2 cols on all screens — feels editorial, shows full cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* ── Best Sellers ── */}
      {bestSellers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-5 py-12 sm:py-16 border-t border-neutral-200">
          <SectionLabel>Best Sellers</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* ── Promo Banner ── */}
      <section className="relative py-20 sm:py-24 px-4 text-center text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={promoImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-900/70" />
        <div className="relative">
          {settings?.promoEyebrow && (
            <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-3 block">
              {settings.promoEyebrow}
            </span>
          )}
          <div className="font-heading text-2xl sm:text-3xl font-bold max-w-sm mx-auto">
            {settings?.promoHeadline || "Built for Those Who Stand Out."}
          </div>
          {settings?.promoSubtext && (
            <div className="mt-2 text-neutral-300 text-sm">{settings.promoSubtext}</div>
          )}
          <Link
            href="/catalogue"
            className="inline-block mt-5 sm:mt-6 px-6 py-3.5 sm:py-3 border border-white text-white text-sm uppercase tracking-wide hover:bg-white hover:text-neutral-900 transition-colors"
          >
            Shop Catalogue
          </Link>
        </div>
      </section>
    </div>
  );
}
