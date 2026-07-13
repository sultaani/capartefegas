import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol:"https", hostname:"res.cloudinary.com" },{ protocol:"https", hostname:"picsum.photos" }] },
  experimental: { turbopack: { root: __dirname } },
  async headers() {
    return [
      { source:"/:path*", headers:[
        { key:"X-Content-Type-Options", value:"nosniff" },
        { key:"X-Frame-Options", value:"DENY" },
        { key:"X-XSS-Protection", value:"1; mode=block" },
        { key:"Referrer-Policy", value:"strict-origin-when-cross-origin" },
        { key:"Permissions-Policy", value:"camera=(), microphone=(), geolocation=(), payment=()" },
      ]},
      { source:"/admin/:path*", headers:[{ key:"Content-Security-Policy", value:"frame-ancestors 'none';" }] },
      { source:"/api/:path*", headers:[{ key:"Cache-Control", value:"no-store, max-age=0" }] },
    ];
  },
};
export default nextConfig;
