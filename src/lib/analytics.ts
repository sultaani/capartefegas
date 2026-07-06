import { db } from "@/lib/db";

export async function getAnalytics() {
  const allOrders = await db.query.orders.findMany({ with: { items: true } });
  const allProducts = await db.query.products.findMany({ with: { variants: true } });

  const delivered = allOrders.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((sum, o) => sum + Number(o.subtotal), 0);

  const openStatuses = ["pending", "confirmed", "processing", "shipped"];
  const openOrders = allOrders.filter((o) => openStatuses.includes(o.status)).length;

  const lowStock = allProducts.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= 3)).length;
  const soldOut = allProducts.filter((p) => p.isActive && p.variants.every((v) => v.stock === 0)).length;

  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  const monthlyRevenue = months.map(({ key, label }) => ({
    month: label,
    revenue: delivered
      .filter((o) => o.createdAt.toISOString().slice(0, 7) === key)
      .reduce((sum, o) => sum + Number(o.subtotal), 0),
  }));

  const bestSellerMap: Record<string, number> = {};
  delivered.forEach((o) => o.items.forEach((it) => {
    bestSellerMap[it.nameSnapshot] = (bestSellerMap[it.nameSnapshot] || 0) + it.quantity;
  }));
  const bestSellers = Object.entries(bestSellerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statusCounts = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => ({
    status,
    count: allOrders.filter((o) => o.status === status).length,
  })).filter((s) => s.count > 0);

  const recentOrders = [...allOrders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((o) => ({ id: o.id, orderNumber: o.orderNumber, customer: `${o.customerFirstName} ${o.customerLastName}`, status: o.status }));

  return { totalRevenue, openOrders, lowStock, soldOut, monthlyRevenue, bestSellers, statusCounts, recentOrders };
}
