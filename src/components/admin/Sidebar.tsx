"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard,Package,Tag,ClipboardList,Layers,Image as ImageIcon,MessageSquare,Truck,Mail,Settings as Cog,LogOut,Menu,X } from "lucide-react";
const NAV = [
  ["/admin","Dashboard",LayoutDashboard],["/admin/products","Products",Package],["/admin/categories","Categories",Tag],
  ["/admin/orders","Orders",ClipboardList],["/admin/collections","Collections",Layers],["/admin/homepage","Homepage",ImageIcon],
  ["/admin/messages","Messages",MessageSquare],["/admin/shipping","Shipping",Truck],["/admin/newsletter","Newsletter",Mail],["/admin/settings","Settings",Cog],
] as const;
function Links({ pathname, badge, onNav }:{ pathname:string; badge:number; onNav?:()=>void }) {
  return <>{NAV.map(([href,label,Icon])=>{
    const active = href==="/admin"?pathname==="/admin":pathname.startsWith(href);
    return <Link key={href} href={href} onClick={onNav} className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm ${active?"bg-white text-neutral-900":"text-neutral-300 hover:bg-neutral-800"}`}>
      <Icon className="w-4 h-4 shrink-0"/>{label}
      {href==="/admin/messages"&&badge>0&&<span className="ml-auto bg-amber-700 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">{badge}</span>}
    </Link>;
  })}</>;
}
export function Sidebar({ newMessageCount }:{ newMessageCount:number }) {
  const pathname = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false);
  async function logout(){ await fetch("/api/admin/logout",{method:"POST"}); router.push("/admin/login"); router.refresh(); }
  const logoutBtn = <button onClick={logout} className="flex items-center gap-3 px-5 py-4 text-sm text-neutral-300 hover:bg-neutral-800 cursor-pointer border-t border-neutral-800 shrink-0 w-full text-left"><LogOut className="w-4 h-4"/> Log out</button>;
  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-neutral-900 text-white flex items-center justify-between px-5 h-14">
        <div className="font-heading font-bold text-sm">CAPARTEFEGAS</div>
        <button onClick={()=>setOpen(true)} aria-label="Open menu" className="cursor-pointer"><Menu className="w-5 h-5"/></button>
      </div>
      {open&&<div className="md:hidden fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-neutral-900/60" onClick={()=>setOpen(false)}/>
        <div className="relative w-64 bg-neutral-900 text-white flex flex-col h-full z-10">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <div className="font-heading font-bold">CAPARTEFEGAS</div>
            <button onClick={()=>setOpen(false)} className="cursor-pointer"><X className="w-5 h-5"/></button>
          </div>
          <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3 overflow-y-auto"><Links pathname={pathname} badge={newMessageCount} onNav={()=>setOpen(false)}/></nav>
          {logoutBtn}
        </div>
      </div>}
      <div className="hidden md:flex w-60 bg-neutral-900 text-white flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-6 shrink-0"><div className="font-heading font-bold">CAPARTEFEGAS</div><div className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase mt-0.5">Admin Console</div></div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto"><Links pathname={pathname} badge={newMessageCount}/></nav>
        {logoutBtn}
      </div>
    </>
  );
}
