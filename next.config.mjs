import path from "path";

// For SQLite provider, DATABASE_URL must always start with file:
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("file:")) {
  const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
