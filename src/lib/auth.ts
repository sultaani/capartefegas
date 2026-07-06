import bcrypt from "bcryptjs";

// Password hashing only — kept separate from session.ts so that
// middleware.ts (Edge runtime) never has to load bcryptjs.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
