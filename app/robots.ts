import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://pravaah-upsc.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard", "/checkout/", "/bookmarks", "/notes"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
