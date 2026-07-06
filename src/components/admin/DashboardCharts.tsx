"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ClipboardList, AlertCircle, Package } from "lucide-react";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#a3a3a3", confirmed: "#3b82f6", processing: "#b45309",
  shipped: "#6366f1", delivered: "#16a34a", cancelled: "#ef4444",
};

type Analytics = {
  totalRevenue: number; openOrders: number; lowStock: number; soldOut: number;
  monthlyRevenue: { month: string; revenue: number }[];
  bestSellers: [string, number][];
  statusCounts: { status: string; count: number }[];
  recentOrders: { id: number; orderNumber: string; customer: string; status: string }[];
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-700", confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-800", shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700", cancelled: "bg-red-50 text-red-700",
};

export function DashboardCharts({ analytics }: { analytics: Analytics }) {
  const maxBestSeller = analytics.bestSellers[0]?.[1] || 1;

  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Dashboard</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Revenue (Delivered)" value={formatNaira(analytics.totalRevenue)} hint="Lifetime, product subtotal only" icon={TrendingUp} />
        <KpiCard label="Open Orders" value={String(analytics.openOrders)} hint="Pending → Shipped" icon={ClipboardList} />
        <KpiCard label="Low Stock" value={String(analytics.lowStock)} hint="1–3 units left in a size" icon={AlertCircle} />
        <KpiCard label="Sold Out" value={String(analytics.soldOut)} hint="No sizes available" icon={Package} />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white border border-neutral-200 p-5">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Monthly Revenue — Delivered Orders</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Bar dataKey="revenue" fill="#92400e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Order Status Mix</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.statusCounts} dataKey="count" nameKey="status" innerRadius={40} outerRadius={70}>
                  {analytics.statusCounts.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.status]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {analytics.statusCounts.map((s) => (
              <div key={s.status} className="flex items-center gap-1 text-[11px] text-neutral-500 capitalize">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} /> {s.status} ({s.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Best Sellers (Delivered)</div>
          <div className="flex flex-col gap-3">
            {analytics.bestSellers.length === 0 && <div className="text-sm text-neutral-400">No delivered orders yet.</div>}
            {analytics.bestSellers.map(([name, qty]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1"><span>{name}</span><span className="text-neutral-500">{qty} sold</span></div>
                <div className="h-1.5 bg-neutral-100"><div className="h-1.5 bg-amber-800" style={{ width: `${(qty / maxBestSeller) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Recent Orders</div>
          <div className="flex flex-col divide-y divide-neutral-100">
            {analytics.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <div className="font-mono text-xs">{o.orderNumber}</div>
                  <div className="text-neutral-500 text-xs">{o.customer}</div>
                </div>
                <span className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wide capitalize ${STATUS_BADGE[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: any }) {
  return (
    <div className="bg-white border border-neutral-200 p-5">
      <div className="flex items-center justify-between text-neutral-400">
        <span className="font-mono text-[11px] tracking-widest uppercase">{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-heading text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{hint}</div>
    </div>
  );
}
