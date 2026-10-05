import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...["refund", "terms", "privacy"].map((p) => ({
      url: `${site.url}/${p}`, lastModified: new Date(site.legalUpdated), changeFrequency: "yearly" as const, priority: 0.3,
    })),
  ];
}
