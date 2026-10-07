import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Day — Routine & Task Flow",
    short_name: "My Day",
    description: "Personal routine and task management application.",
    start_url: "/home",
    id: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#fbfaf7",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
