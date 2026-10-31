import path from "path";

// Preserve PostgreSQL / Neon DATABASE_URL if configured
if (!process.env.DATABASE_URL) {
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
