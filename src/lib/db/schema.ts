import { pgTable,serial,text,varchar,integer,boolean,timestamp,numeric,jsonb,pgEnum,uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", ["pending","pending_payment","confirmed","processing","shipped","delivered","cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["whatsapp","opay"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid","pending","paid","failed"]);
export const messageStatusEnum = pgEnum("message_status", ["new","replied"]);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(), email: varchar("email",{length:255}).notNull().unique(),
  passwordHash: text("password_hash").notNull(), name: varchar("name",{length:120}).notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(), slug: varchar("slug",{length:120}).notNull().unique(),
  name: varchar("name",{length:160}).notNull(), description: text("description").default(""),
  coverImageUrl: text("cover_image_url").default(""), coverImagePublicId: text("cover_image_public_id").default(""),
  featuredOnHomepage: boolean("featured_on_homepage").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(), createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(), slug: varchar("slug",{length:120}).notNull().unique(),
  name: varchar("name",{length:120}).notNull(), sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});
export const products = pgTable("products", {
  id: serial("id").primaryKey(), sku: varchar("sku",{length:60}).notNull().unique(),
  name: varchar("name",{length:200}).notNull(), slug: varchar("slug",{length:220}).notNull().unique(),
  categoryId: integer("category_id").references(()=>categories.id,{onDelete:"set null"}),
  collectionId: integer("collection_id").references(()=>collections.id,{onDelete:"set null"}),
  price: numeric("price",{precision:12,scale:2}).notNull(), description: text("description").default(""),
  material: varchar("material",{length:255}).default(""), careInstructions: text("care_instructions").default(""),
  deliveryEstimate: varchar("delivery_estimate",{length:255}).default(""),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  images: jsonb("images").$type<{url:string;publicId:string}[]>().notNull().default([]),
  isNewArrival: boolean("is_new_arrival").default(false).notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  allowCustomRequest: boolean("allow_custom_request").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(), productId: integer("product_id").notNull().references(()=>products.id,{onDelete:"cascade"}),
  size: varchar("size",{length:20}).notNull(), stock: integer("stock").default(0).notNull(),
},(t)=>({ productSizeUnique: uniqueIndex("product_variants_product_id_size_idx").on(t.productId,t.size) }));
export const orderSequences = pgTable("order_sequences", {
  dateKey: varchar("date_key",{length:8}).primaryKey(), counter: integer("counter").notNull().default(0),
});
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(), orderNumber: varchar("order_number",{length:40}).notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("whatsapp").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  paymentReference: varchar("payment_reference",{length:120}),
  customerFirstName: varchar("customer_first_name",{length:100}).notNull(),
  customerLastName: varchar("customer_last_name",{length:100}).notNull(),
  customerPhone: varchar("customer_phone",{length:40}).notNull(),
  customerEmail: varchar("customer_email",{length:255}).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: varchar("delivery_city",{length:120}).notNull(),
  deliveryState: varchar("delivery_state",{length:60}).notNull(),
  shippingFee: numeric("shipping_fee",{precision:12,scale:2}).notNull().default("0"),
  subtotal: numeric("subtotal",{precision:12,scale:2}).notNull(),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(), orderId: integer("order_id").notNull().references(()=>orders.id,{onDelete:"cascade"}),
  productId: integer("product_id").references(()=>products.id,{onDelete:"set null"}),
  nameSnapshot: varchar("name_snapshot",{length:200}).notNull(),
  priceSnapshot: numeric("price_snapshot",{precision:12,scale:2}).notNull(),
  color: varchar("color",{length:60}).notNull(), size: varchar("size",{length:20}).notNull(),
  quantity: integer("quantity").notNull(), customRequestType: varchar("custom_request_type",{length:60}).default("None"),
  customRequestNote: text("custom_request_note").default(""),
});
export const shippingRates = pgTable("shipping_rates", {
  state: varchar("state",{length:60}).primaryKey(), fee: numeric("fee",{precision:12,scale:2}).notNull(),
});
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(), name: varchar("name",{length:160}).notNull(),
  email: varchar("email",{length:255}).notNull(), subject: varchar("subject",{length:200}).default(""),
  body: text("body").notNull(), status: messageStatusEnum("status").default("new").notNull(),
  adminReply: text("admin_reply").default(""), createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(), email: varchar("email",{length:255}).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: varchar("site_name",{length:120}).notNull().default("Capartefegas"),
  accentColor: varchar("accent_color",{length:20}).notNull().default("#92400e"),
  whatsappNumber: varchar("whatsapp_number",{length:20}).notNull().default("2348000000000"),
  contactEmail: varchar("contact_email",{length:255}).default(""),
  contactPhone: varchar("contact_phone",{length:40}).default(""),
  instagramHandle: varchar("instagram_handle",{length:120}).default(""),
  metaTitle: varchar("meta_title",{length:200}).default(""),
  metaDescription: text("meta_description").default(""),
  heroEyebrow: varchar("hero_eyebrow",{length:160}).default(""),
  heroHeadline: varchar("hero_headline",{length:200}).default(""),
  heroImageUrl: text("hero_image_url").default(""),
  heroCtaPrimary: varchar("hero_cta_primary",{length:60}).default(""),
  heroCtaSecondary: varchar("hero_cta_secondary",{length:60}).default(""),
  promoEyebrow: varchar("promo_eyebrow",{length:160}).default(""),
  promoHeadline: varchar("promo_headline",{length:200}).default(""),
  promoSubtext: varchar("promo_subtext",{length:200}).default(""),
  promoImageUrl: text("promo_image_url").default(""),
});
export const productsRelations = relations(products,({one,many})=>({
  category: one(categories,{fields:[products.categoryId],references:[categories.id]}),
  collection: one(collections,{fields:[products.collectionId],references:[collections.id]}),
  variants: many(productVariants),
}));
export const productVariantsRelations = relations(productVariants,({one})=>({
  product: one(products,{fields:[productVariants.productId],references:[products.id]}),
}));
export const collectionsRelations = relations(collections,({many})=>({products:many(products)}));
export const ordersRelations = relations(orders,({many})=>({items:many(orderItems)}));
export const orderItemsRelations = relations(orderItems,({one})=>({
  order: one(orders,{fields:[orderItems.orderId],references:[orders.id]}),
  product: one(products,{fields:[orderItems.productId],references:[products.id]}),
}));
