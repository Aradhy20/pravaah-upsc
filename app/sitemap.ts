import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://pravaah-upsc.vercel.app";
  const currentDate = new Date().toISOString();

  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/pyqs`, lastModified: currentDate, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/exams`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/mock-tests`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/daily-quiz`, lastModified: currentDate, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/current-affairs`, lastModified: currentDate, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/mains`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: currentDate, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const examRoutes = [
    { url: `${baseUrl}/exams/upsc-cse-prelims-gs-1`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${baseUrl}/exams/upsc-cse-prelims-csat`, lastModified: currentDate, changeFrequency: "weekly" as const, priority: 0.85 },
  ];

  const subjects = [
    "polity-governance",
    "economy-development",
    "environment-biodiversity",
    "history-culture",
    "geography-agriculture",
    "science-technology",
    "csat-quant",
    "csat-reasoning",
    "csat-comprehension",
  ];

  const subjectRoutes = subjects.map((slug) => ({
    url: `${baseUrl}/subjects/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const pyqRoutes: MetadataRoute.Sitemap = [];

  for (const year of years) {
    pyqRoutes.push({
      url: `${baseUrl}/pyqs/year/${year}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    });
    pyqRoutes.push({
      url: `${baseUrl}/pyqs/${year}/gs-1`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    });
    pyqRoutes.push({
      url: `${baseUrl}/pyqs/${year}/csat`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    });
  }

  return [...staticRoutes, ...examRoutes, ...subjectRoutes, ...pyqRoutes];
}
