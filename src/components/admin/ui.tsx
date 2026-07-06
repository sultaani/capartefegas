"use client";

import { X } from "lucide-react";

export function PrimaryButton({ children, onClick, className = "", disabled, type = "button" }: any) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-4 py-2 bg-neutral-900 text-white text-sm hover:bg-amber-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2 ${className}`}>
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }: any) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 border border-neutral-300 text-neutral-700 text-sm hover:border-neutral-900 hover:text-neutral-900 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${className}`}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">{children}</div>;
}

export const STATUS_BADGE: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-700", confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-800", shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700", cancelled: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wide capitalize ${STATUS_BADGE[status] || "bg-neutral-100 text-neutral-700"}`}>{status}</span>;
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white">
          <div className="font-heading font-bold">{title}</div>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs text-neutral-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900";
