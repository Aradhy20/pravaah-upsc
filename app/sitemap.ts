import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://pravaah-upsc.vercel.app";

  const staticRoutes = [
    "",
    "/prelims/pyqs",
    "/mock-tests",
    "/daily-quiz",
    "/current-affairs",
    "/study-planner",
    "/mains",
    "/syllabus",
    "/subjects",
    "/coverage",
    "/video-academy",
    "/topper-copies",
    "/revision",
    "/pricing",
    "/about",
    "/faq",
    "/privacy",
    "/terms",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/daily-quiz" || route === "/current-affairs" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/prelims") || route.startsWith("/mock-tests") ? 0.9 : 0.7,
  }));
}
