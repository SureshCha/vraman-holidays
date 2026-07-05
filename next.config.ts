import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Self-contained server bundle for the Babal/cPanel (Passenger) production
  // host. `next build` emits .next/standalone/server.js, which Passenger runs.
  output: "standalone",
  // nodemailer uses dynamic requires and doesn't bundle cleanly — keep it
  // external so it's traced into the standalone node_modules at runtime.
  serverExternalPackages: ["nodemailer"],
  // Next's file tracing sometimes misses the generated Prisma client's runtime
  // assets (e.g. the query-compiler .wasm used with the pg driver adapter).
  // Force them into the standalone bundle so the server can query the DB.
  // NOTE: if a production runtime error mentions a missing Prisma engine/wasm
  // or "@/generated/prisma", widen this glob — see DEPLOYMENT.md.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://js.stripe.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://picsum.photos",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://res.cloudinary.com https://api.cloudinary.com",
              "frame-src https://js.stripe.com https://rc.esewa.com.np https://khalti.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
