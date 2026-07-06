import Link from "next/link";
import { db } from "@/lib/db";
import { SectionLabel } from "@/components/storefront/SectionLabel";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const allCollections = await db.query.collections.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-16">
      <SectionLabel>Collections</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
        {allCollections.map((c) => (
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
    </div>
  );
}
