/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./prisma/schema.prisma"],
    },
  },
};

export default nextConfig;
