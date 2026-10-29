import path from "path";

if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
