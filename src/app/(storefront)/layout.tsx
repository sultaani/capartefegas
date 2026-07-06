import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "../globals.css";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CartProvider } from "@/components/storefront/CartProvider";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import type { SiteSettings } from "@/lib/types";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-syne" });
const manrope = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-manrope" });

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Capartefegas",
  accentColor: "#92400e",
  whatsappNumber: "2348000000000",
  contactEmail: "", contactPhone: "", instagramHandle: "",
  metaTitle: "Capartefegas", metaDescription: "Premium Nigerian streetwear.",
  heroEyebrow: "", heroHeadline: "", heroImageUrl: "", heroCtaPrimary: "", heroCtaSecondary: "",
  promoEyebrow: "", promoHeadline: "", promoSubtext: "", promoImageUrl: "",
};

async function getSettings(): Promise<SiteSettings> {
  try {
    const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
    return row ?? DEFAULT_SETTINGS;
  } catch {
    // DB not reachable / not migrated yet — fail soft instead of crashing the whole app.
    return DEFAULT_SETTINGS;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.metaTitle || settings.siteName,
    description: settings.metaDescription || undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" style={{ "--accent": settings.accentColor } as React.CSSProperties}>
      <body className={`${syne.variable} ${manrope.variable} font-body bg-white text-neutral-900`}>
        <CartProvider>
          <Navbar siteName={settings.siteName} />
          <main>{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
