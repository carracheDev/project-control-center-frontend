import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Project Control Center",
    short_name: "PCC",
    description: "Pilotage des projets de validation et de développement logiciel",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#173f45",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}