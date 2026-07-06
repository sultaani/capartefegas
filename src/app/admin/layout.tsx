import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "../globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-syne" });
const manrope = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-manrope" });

export const metadata: Metadata = { title: "Capartefegas — Admin Console" };

// This is its own ROOT layout (separate from the storefront's), so the
// admin console never renders the storefront navbar/cart/footer — same
// design language (Syne/Manrope/amber accent), completely different
// shell, per the PRD's split between customer site and admin system.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${manrope.variable} font-body bg-neutral-50 text-neutral-900`}>
        {children}
      </body>
    </html>
  );
}
