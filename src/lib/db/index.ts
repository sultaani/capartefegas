import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

// A single shared connection pool, reused across hot reloads in dev so we
// don't exhaust Postgres connections (Next.js dev server re-evaluates
// modules on every change without this guard).
declare global {
  // eslint-disable-next-line no-var
  var __capartefegasSql: ReturnType<typeof postgres> | undefined;
}

const sql = global.__capartefegasSql ?? postgres(process.env.DATABASE_URL, { max: 10 });
if (process.env.NODE_ENV !== "production") global.__capartefegasSql = sql;

export const db = drizzle(sql, { schema });
export { sql };
