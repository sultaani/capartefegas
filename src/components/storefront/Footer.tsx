import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { NewsletterForm } from "./NewsletterForm";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-neutral-200 mt-16 sm:mt-20">
      {/* Newsletter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14">
        <NewsletterForm />
      </div>

      {/* Links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 pb-8 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-neutral-100 pt-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="font-heading font-bold mb-1">{settings.siteName.toUpperCase()}</div>
          <div className="text-xs text-neutral-500 font-mono tracking-wide">CPT — EST. LAGOS</div>
        </div>
        <div>
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Shop</div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/catalogue" className="hover:text-neutral-900">Catalogue</Link>
            <Link href="/collections" className="hover:text-neutral-900">Collections</Link>
          </div>
        </div>
        <div>
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Support</div>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/contact" className="hover:text-neutral-900">Contact</Link>
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-neutral-900 truncate">
                {settings.contactEmail}
              </a>
            )}
            {settings.contactPhone && <span>{settings.contactPhone}</span>}
          </div>
        </div>
        <div>
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Follow</div>
          <div className="flex gap-3 text-neutral-600">
            <Instagram className="w-4 h-4" />
            <MessageCircle className="w-4 h-4" />
          </div>
          {settings.instagramHandle && (
            <div className="text-xs text-neutral-500 mt-2">{settings.instagramHandle}</div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400 pb-6">
        © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
      </div>
    </footer>
  );
}
