import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { hashPassword } from "../auth";

const sql = postgres(process.env.DATABASE_URL as string, { max: 1 });
const db = drizzle(sql, { schema });

const CATEGORIES = [
  { name: "Shirts",       isActive: true  },
  { name: "Hoodies",      isActive: true  },
  { name: "Sweatshirts",  isActive: true  },
  { name: "Tracksuits",   isActive: true  },
  { name: "Pants",        isActive: true  },
  { name: "Shorts",       isActive: true  },
  { name: "Jackets",      isActive: true  },
  { name: "Jerseys",      isActive: true  },
  { name: "Caps",         isActive: true  },
  { name: "Accessories",  isActive: false },
];

const COLLECTIONS = [
  { slug: "horizons",   name: "New Horizons",  description: "The current drop. Built for everyday statements.", coverImageUrl: "https://picsum.photos/seed/cpt-horizons/900/700",  featuredOnHomepage: true },
  { slug: "noir",       name: "Noir Standard", description: "Monochrome staples, cut for layering.",           coverImageUrl: "https://picsum.photos/seed/cpt-noir/900/700",      featuredOnHomepage: true },
  { slug: "lagos-heat", name: "Lagos Heat",    description: "Lightweight pieces for the dry season.",          coverImageUrl: "https://picsum.photos/seed/cpt-heat/900/700",      featuredOnHomepage: true },
];

const SHIPPING: Record<string, number> = {
  "Lagos": 2500, "Abuja (FCT)": 3500, "Abia": 4500, "Adamawa": 5000, "Akwa Ibom": 4500,
  "Anambra": 4000, "Bauchi": 5000, "Bayelsa": 4500, "Benue": 4500, "Borno": 5500,
  "Cross River": 4500, "Delta": 4000, "Ebonyi": 4500, "Edo": 4000, "Ekiti": 3500,
  "Enugu": 4000, "Gombe": 5000, "Imo": 4500, "Jigawa": 5000, "Kaduna": 4500,
  "Kano": 4500, "Katsina": 5000, "Kebbi": 5000, "Kogi": 4000, "Kwara": 3500,
  "Nasarawa": 4000, "Niger": 4500, "Ogun": 3000, "Ondo": 3500, "Osun": 3500,
  "Oyo": 3500, "Plateau": 4500, "Rivers": 4000, "Sokoto": 5500, "Taraba": 5000,
  "Yobe": 5500, "Zamfara": 5000, "Other": 5500,
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

async function main() {
  console.log("Seeding categories...");
  const catRows = await db.insert(schema.categories)
    .values(CATEGORIES.map((c, i) => ({ slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: c.name, sortOrder: i, isActive: c.isActive })))
    .onConflictDoNothing().returning();
  const catBySlug = Object.fromEntries(catRows.map(c => [c.slug, c.id]));

  console.log("Seeding collections...");
  const colRows = await db.insert(schema.collections).values(COLLECTIONS).onConflictDoNothing().returning();
  const colBySlug = Object.fromEntries(colRows.map(c => [c.slug, c.id]));

  console.log("Seeding shipping rates (all 37)...");
  await db.insert(schema.shippingRates)
    .values(Object.entries(SHIPPING).map(([state, fee]) => ({ state, fee: String(fee) })))
    .onConflictDoNothing();

  console.log("Seeding site settings...");
  await db.insert(schema.siteSettings).values({
    id: 1, siteName: "Capartefegas", accentColor: "#92400e",
    whatsappNumber: process.env.WHATSAPP_NUMBER || "2348000000000",
    contactEmail: "hello@capartefegas.com", contactPhone: "+234 800 000 0000",
    instagramHandle: "@capartefegas",
    metaTitle: "Capartefegas — Premium Nigerian Streetwear",
    metaDescription: "Lagos-built streetwear for everyday statements.",
    heroEyebrow: "New Horizons — Drop 003", heroHeadline: "Explore New Horizons.",
    heroImageUrl: "https://picsum.photos/seed/cpt-hero/1600/1200",
    heroCtaPrimary: "Explore Collection", heroCtaSecondary: "Shop Catalogue",
    promoEyebrow: "Holiday Capsule — Limited Run",
    promoHeadline: "Built for Those Who Stand Out.", promoSubtext: "Crafted Without Compromise.",
    promoImageUrl: "https://picsum.photos/seed/cpt-promo/1600/800",
  }).onConflictDoNothing();

  console.log("Seeding products...");
  const seeds = [
    { sku:"CPT/SH/014", name:"Oversized Boxy Shirt",   cat:"shirts",      col:"horizons",   price:"32000", colors:["Black","Off-White"],         stock:{S:4,M:6,L:0,XL:2,XXL:0}, isNew:true,  isBest:false, desc:"A boxy, oversized shirt cut from heavyweight cotton twill.", material:"100% heavyweight cotton twill", care:"Machine wash cold, inside out.", delivery:"2–5 days (Lagos), 4–8 days (other states)." },
    { sku:"CPT/HD/021", name:"Signature Hoodie",        cat:"hoodies",     col:"horizons",   price:"45000", colors:["Black","Charcoal","Cream"],   stock:{S:2,M:0,L:5,XL:3,XXL:2}, isNew:true,  isBest:true,  desc:"Heavyweight fleece hoodie with a structured hood and ribbed cuffs.", material:"420gsm brushed fleece", care:"Machine wash cold, hang dry.", delivery:"2–5 days (Lagos), 4–8 days (other states)." },
    { sku:"CPT/SW/009", name:"Crewneck Sweatshirt",     cat:"sweatshirts", col:"noir",       price:"38000", colors:["Black","Grey"],               stock:{S:3,M:4,L:4,XL:0,XXL:0}, isNew:false, isBest:true,  desc:"A clean crewneck with a slightly cropped body and dropped shoulder seam.", material:"320gsm cotton-poly fleece", care:"Machine wash cold.", delivery:"2–5 days (Lagos), 4–8 days (other states)." },
    { sku:"CPT/TS/005", name:"Track Suit — Two Piece",  cat:"tracksuits",  col:"noir",       price:"68000", colors:["Black","Navy"],               stock:{S:1,M:2,L:0,XL:1,XXL:0}, isNew:false, isBest:true,  desc:"Matching jacket and pant in brushed-back tricot. Tonal zips, tapered leg.", material:"Brushed tricot", care:"Machine wash cold, do not iron print.", delivery:"3–6 days (Lagos), 5–9 days (other states)." },
    { sku:"CPT/PT/011", name:"Tapered Cargo Pant",      cat:"pants",       col:"lagos-heat", price:"35000", colors:["Black","Khaki"],              stock:{S:5,M:5,L:2,XL:0,XXL:3}, isNew:true,  isBest:false, desc:"Tapered cargo pant with utility pockets and an adjustable waist.", material:"Cotton ripstop", care:"Machine wash cold.", delivery:"2–5 days (Lagos), 4–8 days (other states)." },
    { sku:"CPT/SR/006", name:"Mesh Lined Short",        cat:"shorts",      col:"lagos-heat", price:"22000", colors:["Black","Off-White","Olive"],  stock:{S:6,M:6,L:4,XL:4,XXL:2}, isNew:false, isBest:false, desc:"Lightweight short with a mesh liner. Built for Lagos heat, not the gym.", material:"Nylon shell, mesh lining", care:"Machine wash cold.", delivery:"2–5 days (Lagos), 4–8 days (other states)." },
  ];

  for (const p of seeds) {
    const [row] = await db.insert(schema.products).values({
      sku: p.sku, name: p.name, slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
      categoryId: catBySlug[p.cat] ?? null, collectionId: colBySlug[p.col] ?? null,
      price: p.price, description: p.desc, material: p.material,
      careInstructions: p.care, deliveryEstimate: p.delivery, colors: p.colors,
      images: [{ url: `https://picsum.photos/seed/${p.sku.replace(/\//g,"-")}/800/1000`, publicId: "" }],
      isNewArrival: p.isNew, isBestSeller: p.isBest,
    }).onConflictDoNothing().returning();
    if (row) {
      await db.insert(schema.productVariants)
        .values(SIZES.map(size => ({ productId: row.id, size, stock: (p.stock as any)[size] ?? 0 })))
        .onConflictDoNothing();
    }
  }

  // Backfill XXL for existing products
  const allP = await db.query.products.findMany({ columns: { id: true } });
  for (const p of allP) {
    await db.insert(schema.productVariants).values({ productId: p.id, size: "XXL", stock: 0 }).onConflictDoNothing();
  }

  console.log("Seeding admin...");
  const email = process.env.SEED_ADMIN_EMAIL || "admin@capartefegas.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  await db.insert(schema.adminUsers).values({ email, passwordHash: await hashPassword(password), name: "Admin" }).onConflictDoNothing();

  await db.insert(schema.contactMessages).values([
    { name:"Tobi Lawal", email:"tobi.lawal@example.com", subject:"Sizing question", body:"Does the Signature Hoodie run true to size?", status:"new" },
    { name:"Aisha Bello", email:"aisha.b@example.com", subject:"Wholesale enquiry", body:"We run a concept store in Abuja.", status:"new" },
  ]).onConflictDoNothing();
  await db.insert(schema.newsletterSubscribers).values([{ email:"wale.ade@example.com" },{ email:"blessing.k@example.com" }]).onConflictDoNothing();

  console.log(`Seed complete. Admin: ${email} / ${password}`);
  await sql.end();
}
main().catch(e => { console.error(e); process.exit(1); });
