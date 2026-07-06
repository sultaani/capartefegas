import { sql as sqlOp } from "drizzle-orm";
import { orderSequences } from "@/lib/db/schema";
import type { db as dbClient } from "@/lib/db";

/**
 * Generates the next order number for "today" — format CPT/XX/YYYYMMDDNNN.
 *
 * This MUST be called with `tx`, the transaction object passed into a
 * `db.transaction(async (tx) => { ... })` block that also inserts the
 * order row, and that transaction must use SERIALIZABLE-safe semantics —
 * Postgres' UPSERT below takes a row lock on the order_sequences row for
 * "today", so concurrent checkouts queue instead of racing. This is the
 * fix for the duplicate-order-number risk flagged in the prototype's
 * in-memory counter.
 */
export async function getNextOrderNumber(
  tx: Parameters<Parameters<typeof dbClient.transaction>[0]>[0],
  customerFirstName: string,
  customerLastName: string
) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateKey = `${y}${m}${d}`;

  const [row] = await tx
    .insert(orderSequences)
    .values({ dateKey, counter: 1 })
    .onConflictDoUpdate({
      target: orderSequences.dateKey,
      set: { counter: sqlOp`${orderSequences.counter} + 1` },
    })
    .returning({ counter: orderSequences.counter });

  const seq = String(row.counter).padStart(3, "0");
  const initials = `${customerFirstName.trim()[0] ?? "C"}${customerLastName.trim()[0] ?? "X"}`.toUpperCase();
  return `CPT/${initials}/${dateKey}${seq}`;
}
