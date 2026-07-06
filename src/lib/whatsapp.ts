type OrderItemForMessage = {
  nameSnapshot: string;
  color: string;
  size: string;
  quantity: number;
  priceSnapshot: string | number;
  customRequestType?: string | null;
  customRequestNote?: string | null;
};

type OrderForMessage = {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  subtotal: string | number;
  shippingFee: string | number;
  notes?: string | null;
};

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function buildWhatsAppMessage(order: OrderForMessage, items: OrderItemForMessage[]) {
  const subtotal = Number(order.subtotal);
  const shippingFee = Number(order.shippingFee);
  const lines: string[] = [];

  lines.push(`Hi Capartefegas, I'd like to confirm my order.`, ``);
  lines.push(`Order: ${order.orderNumber}`);
  lines.push(`Name: ${order.customerFirstName} ${order.customerLastName}`);
  lines.push(`Phone: ${order.customerPhone}`);
  lines.push(`Email: ${order.customerEmail}`);
  lines.push(`Delivery: ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState}`, ``);
  lines.push(`Items:`);
  items.forEach((it) => {
    lines.push(`• ${it.nameSnapshot} (${it.color}, ${it.size}) x${it.quantity} — ${formatNaira(Number(it.priceSnapshot) * it.quantity)}`);
    if (it.customRequestType && it.customRequestType !== "None") {
      lines.push(`   Custom request: ${it.customRequestType}${it.customRequestNote ? " — " + it.customRequestNote : ""}`);
    }
  });
  lines.push(``);
  lines.push(`Subtotal: ${formatNaira(subtotal)}`);
  lines.push(`Shipping (${order.deliveryState}): ${formatNaira(shippingFee)}`);
  lines.push(`Total: ${formatNaira(subtotal + shippingFee)}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push(``, `Thank you!`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
