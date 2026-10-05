import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#EDEFF8",
    theme_color: "#EDEFF8",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
