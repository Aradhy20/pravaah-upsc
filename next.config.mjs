import path from "path";

// In local development, fall back to SQLite only if DATABASE_URL is not set
if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./prisma/dev.db", "./prisma/schema.prisma"],
    },
  },
};

export default nextConfig;
