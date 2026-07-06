"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PrimaryButton, SectionLabel, Field, inputClass } from "./ui";

type Settings = {
  siteName: string; accentColor: string; whatsappNumber: string; contactEmail: string | null;
  contactPhone: string | null; instagramHandle: string | null; metaTitle: string | null; metaDescription: string | null;
};

export function SettingsClient({ settings: initial }: { settings: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [saved, setSaved] = useState(false);

  function update(field: keyof Settings, value: string) {
    setSettings((s) => ({ ...s, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Settings</div>
      <form onSubmit={save} className="grid md:grid-cols-2 gap-x-8 max-w-3xl">
        <div>
          <SectionLabel>Branding</SectionLabel>
          <Field label="Site name"><input value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className={inputClass} /></Field>
          <Field label="Accent color">
            <div className="flex items-center gap-3">
              <input type="color" value={settings.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="w-10 h-10 border border-neutral-300 cursor-pointer" />
              <span className="font-mono text-xs text-neutral-500">{settings.accentColor}</span>
            </div>
          </Field>

          <SectionLabel>SEO</SectionLabel>
          <Field label="Meta title"><input value={settings.metaTitle || ""} onChange={(e) => update("metaTitle", e.target.value)} className={inputClass} /></Field>
          <Field label="Meta description"><textarea value={settings.metaDescription || ""} onChange={(e) => update("metaDescription", e.target.value)} className={`${inputClass} h-20`} /></Field>
        </div>

        <div>
          <SectionLabel>Contact &amp; WhatsApp</SectionLabel>
          <Field label="WhatsApp business number (with country code)"><input value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className={`${inputClass} font-mono`} /></Field>
          <div className="text-xs text-neutral-400 -mt-2 mb-3">This is the number every checkout redirects orders to.</div>
          <Field label="Contact email"><input type="email" value={settings.contactEmail || ""} onChange={(e) => update("contactEmail", e.target.value)} className={inputClass} /></Field>
          <Field label="Contact phone"><input value={settings.contactPhone || ""} onChange={(e) => update("contactPhone", e.target.value)} className={inputClass} /></Field>
          <Field label="Instagram handle"><input value={settings.instagramHandle || ""} onChange={(e) => update("instagramHandle", e.target.value)} className={inputClass} /></Field>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <PrimaryButton type="submit">Save Settings</PrimaryButton>
          {saved && <span className="flex items-center gap-1 text-sm text-green-700"><Check className="w-4 h-4" /> Saved</span>}
        </div>
      </form>
    </div>
  );
}
