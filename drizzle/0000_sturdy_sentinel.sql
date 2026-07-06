CREATE TYPE "public"."message_status" AS ENUM('new', 'replied');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(120) DEFAULT 'Admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text DEFAULT '',
	"cover_image_url" text DEFAULT '',
	"cover_image_public_id" text DEFAULT '',
	"featured_on_homepage" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(200) DEFAULT '',
	"body" text NOT NULL,
	"status" "message_status" DEFAULT 'new' NOT NULL,
	"admin_reply" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"name_snapshot" varchar(200) NOT NULL,
	"price_snapshot" numeric(12, 2) NOT NULL,
	"color" varchar(60) NOT NULL,
	"size" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"custom_request_type" varchar(60) DEFAULT 'None',
	"custom_request_note" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "order_sequences" (
	"date_key" varchar(8) PRIMARY KEY NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(40) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"customer_first_name" varchar(100) NOT NULL,
	"customer_last_name" varchar(100) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_city" varchar(120) NOT NULL,
	"delivery_state" varchar(60) NOT NULL,
	"shipping_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"size" varchar(20) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(60) NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"category_id" integer,
	"collection_id" integer,
	"price" numeric(12, 2) NOT NULL,
	"description" text DEFAULT '',
	"material" varchar(255) DEFAULT '',
	"care_instructions" text DEFAULT '',
	"delivery_estimate" varchar(255) DEFAULT '',
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_new_arrival" boolean DEFAULT false NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"allow_custom_request" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"state" varchar(60) PRIMARY KEY NOT NULL,
	"fee" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"site_name" varchar(120) DEFAULT 'Capartefegas' NOT NULL,
	"accent_color" varchar(20) DEFAULT '#92400e' NOT NULL,
	"whatsapp_number" varchar(20) DEFAULT '2348000000000' NOT NULL,
	"contact_email" varchar(255) DEFAULT '',
	"contact_phone" varchar(40) DEFAULT '',
	"instagram_handle" varchar(120) DEFAULT '',
	"meta_title" varchar(200) DEFAULT '',
	"meta_description" text DEFAULT '',
	"hero_eyebrow" varchar(160) DEFAULT '',
	"hero_headline" varchar(200) DEFAULT '',
	"hero_image_url" text DEFAULT '',
	"hero_cta_primary" varchar(60) DEFAULT '',
	"hero_cta_secondary" varchar(60) DEFAULT '',
	"promo_eyebrow" varchar(160) DEFAULT '',
	"promo_headline" varchar(200) DEFAULT '',
	"promo_subtext" varchar(200) DEFAULT '',
	"promo_image_url" text DEFAULT ''
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_id_size_idx" ON "product_variants" USING btree ("product_id","size");