export type ProductVariant = { id: number; size: string; stock: number };
export type ProductImage = { url: string; publicId: string };

export type Product = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  material: string | null;
  careInstructions: string | null;
  deliveryEstimate: string | null;
  colors: string[];
  images: ProductImage[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  allowCustomRequest: boolean;
  variants: ProductVariant[];
  category: { id: number; slug: string; name: string } | null;
  collection: { id: number; slug: string; name: string } | null;
};

export type Collection = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  featuredOnHomepage: boolean;
  sortOrder: number;
};

export type SiteSettings = {
  siteName: string;
  accentColor: string;
  whatsappNumber: string;
  contactEmail: string | null;
  contactPhone: string | null;
  instagramHandle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  heroEyebrow: string | null;
  heroHeadline: string | null;
  heroImageUrl: string | null;
  heroCtaPrimary: string | null;
  heroCtaSecondary: string | null;
  promoEyebrow: string | null;
  promoHeadline: string | null;
  promoSubtext: string | null;
  promoImageUrl: string | null;
};

export type CartItem = {
  productId: number;
  sku: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  maxStock: number;
  customRequestType: string;
  customRequestNote: string;
};
