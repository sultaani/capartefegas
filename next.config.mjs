import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // Silences the "multiple lockfiles / inferred workspace root" warning on
  // Windows when there is a package-lock.json in a parent folder. This pins
  // Turbopack to the project directory so it doesn't walk up to C:\Users\user.
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;
