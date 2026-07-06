import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { hashPassword } from "../auth";

const sql = postgres(process.env.DATABASE_URL as string, { max: 1 });
const db = drizzle(sql, { schema });

const CATEGORIES = ["Shirts", "Hoodies", "Sweatshirts", "Tracksuits", "Pants", "Shorts"];

const COLLECTIONS = [
  { slug: "horizons", name: "New Horizons", description: "The current drop. Built for everyday statements.", coverImageUrl: "https://picsum.photos/seed/cpt-horizons/900/700", featuredOnHomepage: true },
  { slug: "noir", name: "Noir Standard", description: "Monochrome staples, cut for layering.", coverImageUrl: "https://picsum.photos/seed/cpt-noir/900/700", featuredOnHomepage: true },
  { slug: "lagos-heat", name: "Lagos Heat", description: "Lightweight pieces for the dry season.", coverImageUrl: "https://picsum.photos/seed/cpt-heat/900/700", featuredOnHomepage: true },
];

const SHIPPING: Record<string, number> = {
  "Lagos": 2500, "Abuja (FCT)": 3500, "Ogun": 3000, "Rivers": 4000,
  "Kano": 4500, "Oyo": 3500, "Kaduna": 4500, "Enugu": 4000,
  "Delta": 4000, "Other": 5000,
};

// XXL included — stock defaults to 0 so it shows "Sold Out" for that size
// until the admin adds stock. Existing S/M/L/XL variants are preserved
// with ON CONFLICT DO NOTHING.
const SIZES = ["S", "M", "L", "XL", "XXL"];

async function main() {
  console.log("Seeding categories…");
  const categoryRows = await db.insert(schema.categories)
    .values(CATEGORIES.map((name, i) => ({ slug: name.toLowerCase(), name, sortOrder: i })))
    .onConflictDoNothing()
    .returning();
  const categoryBySlug = Object.fromEntries(categoryRows.map((c) => [c.slug, c.id]));

  console.log("Seeding collections…");
  const collectionRows = await db.insert(schema.collections)
    .values(COLLECTIONS)
    .onConflictDoNothing()
    .returning();
  const collectionBySlug = Object.fromEntries(collectionRows.map((c) => [c.slug, c.id]));

  console.log("Seeding shipping rates…");
  await db.insert(schema.shippingRates)
    .values(Object.entries(SHIPPING).map(([state, fee]) => ({ state, fee: String(fee) })))
    .onConflictDoNothing();

  console.log("Seeding site settings…");
  await db.insert(schema.siteSettings).values({
    id: 1,
    siteName: "Capartefegas",
    accentColor: "#92400e",
    whatsappNumber: process.env.WHATSAPP_NUMBER || "2348000000000",
    contactEmail: "hello@capartefegas.com",
    contactPhone: "+234 800 000 0000",
    instagramHandle: "@capartefegas",
    metaTitle: "Capartefegas — Premium Nigerian Streetwear",
    metaDescription: "Lagos-built streetwear for everyday statements.",
    heroEyebrow: "New Horizons — Drop 003",
    heroHeadline: "Explore New Horizons.",
    heroImageUrl: "https://picsum.photos/seed/cpt-hero/1600/1200",
    heroCtaPrimary: "Explore Collection",
    heroCtaSecondary: "Shop Catalogue",
    promoEyebrow: "Holiday Capsule — Limited Run",
    promoHeadline: "Built for Those Who Stand Out.",
    promoSubtext: "Crafted Without Compromise.",
    promoImageUrl: "https://picsum.photos/seed/cpt-promo/1600/800",
  }).onConflictDoNothing();

  console.log("Seeding products + variants (S/M/L/XL/XXL)…");
  const productSeeds = [
    { sku: "CPT/SH/014", name: "Oversized Boxy Shirt", category: "shirts", collection: "horizons", price: "32000", colors: ["Black", "Off-White"], stock: { S: 4, M: 6, L: 0, XL: 2, XXL: 0 }, isNewArrival: true, isBestSeller: false, desc: "A boxy, oversized shirt cut from heavyweight cotton twill. Dropped shoulders, single chest pocket.", material: "100% heavyweight cotton twill", care: "Machine wash cold, inside out. Do not tumble dry.", delivery: "2–5 working days (Lagos), 4–8 days (other states)." },
    { sku: "CPT/HD/021", name: "Signature Hoodie", category: "hoodies", collection: "horizons", price: "45000", colors: ["Black", "Charcoal", "Cream"], stock: { S: 2, M: 0, L: 5, XL: 3, XXL: 2 }, isNewArrival: true, isBestSeller: true, desc: "Heavyweight fleece hoodie with a structured hood and ribbed cuffs.", material: "420gsm brushed fleece", care: "Machine wash cold, hang dry.", delivery: "2–5 working days (Lagos), 4–8 days (other states)." },
    { sku: "CPT/SW/009", name: "Crewneck Sweatshirt", category: "sweatshirts", collection: "noir", price: "38000", colors: ["Black", "Grey"], stock: { S: 3, M: 4, L: 4, XL: 0, XXL: 0 }, isNewArrival: false, isBestSeller: true, desc: "A clean crewneck with a slightly cropped body and dropped shoulder seam.", material: "320gsm cotton-poly fleece", care: "Machine wash cold.", delivery: "2–5 working days (Lagos), 4–8 days (other states)." },
    { sku: "CPT/TS/005", name: "Track Suit — Two Piece", category: "tracksuits", collection: "noir", price: "68000", colors: ["Black", "Navy"], stock: { S: 1, M: 2, L: 0, XL: 1, XXL: 0 }, isNewArrival: false, isBestSeller: true, desc: "Matching jacket and pant in brushed-back tricot. Tonal zips, tapered leg.", material: "Brushed tricot, tonal hardware", care: "Machine wash cold, do not iron print.", delivery: "3–6 working days (Lagos), 5–9 days (other states)." },
    { sku: "CPT/PT/011", name: "Tapered Cargo Pant", category: "pants", collection: "lagos-heat", price: "35000", colors: ["Black", "Khaki"], stock: { S: 5, M: 5, L: 2, XL: 0, XXL: 3 }, isNewArrival: true, isBestSeller: false, desc: "Tapered cargo pant with utility pockets and an adjustable waist.", material: "Cotton ripstop", care: "Machine wash cold.", delivery: "2–5 working days (Lagos), 4–8 days (other states)." },
    { sku: "CPT/SR/006", name: "Mesh Lined Short", category: "shorts", collection: "lagos-heat", price: "22000", colors: ["Black", "Off-White", "Olive"], stock: { S: 6, M: 6, L: 4, XL: 4, XXL: 2 }, isNewArrival: false, isBestSeller: false, desc: "Lightweight short with a mesh liner. Built for Lagos heat, not the gym.", material: "Nylon shell, mesh lining", care: "Machine wash cold.", delivery: "2–5 working days (Lagos), 4–8 days (other states)." },
  ];

  for (const p of productSeeds) {
    const [row] = await db.insert(schema.products).values({
      sku: p.sku,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categoryId: categoryBySlug[p.category] ?? null,
      collectionId: collectionBySlug[p.collection] ?? null,
      price: p.price,
      description: p.desc,
      material: p.material,
      careInstructions: p.care,
      deliveryEstimate: p.delivery,
      colors: p.colors,
      images: [{ url: `https://picsum.photos/seed/${p.sku.replace(/\//g, "-")}/800/1000`, publicId: "" }],
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
    }).onConflictDoNothing().returning();

    if (row) {
      // Insert all 5 sizes; skip if the variant already exists
      await db.insert(schema.productVariants)
        .values(SIZES.map((size) => ({ productId: row.id, size, stock: (p.stock as any)[size] ?? 0 })))
        .onConflictDoNothing();
    }
  }

  // Add XXL variant to any products that were already seeded and lack it
  console.log("Backfilling XXL variants for existing products…");
  const existingProducts = await db.query.products.findMany({ columns: { id: true } });
  for (const ep of existingProducts) {
    await db.insert(schema.productVariants)
      .values({ productId: ep.id, size: "XXL", stock: 0 })
      .onConflictDoNothing();
  }

  console.log("Seeding admin user…");
  const email = process.env.SEED_ADMIN_EMAIL || "admin@capartefegas.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  await db.insert(schema.adminUsers).values({
    email,
    passwordHash: await hashPassword(password),
    name: "Admin",
  }).onConflictDoNothing();
  console.log(`Admin login → email: ${email} / password: ${password}`);

  console.log("Seeding sample messages + subscribers…");
  await db.insert(schema.contactMessages).values([
    { name: "Tobi Lawal", email: "tobi.lawal@example.com", subject: "Sizing question", body: "Hi, does the Signature Hoodie run true to size or oversized? I'm usually a UK M.", status: "new" },
    { name: "Aisha Bello", email: "aisha.b@example.com", subject: "Wholesale enquiry", body: "We run a concept store in Abuja and would love to discuss stocking a few pieces.", status: "new" },
  ]).onConflictDoNothing();

  await db.insert(schema.newsletterSubscribers).values([
    { email: "wale.ade@example.com" },
    { email: "blessing.k@example.com" },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  await sql.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
