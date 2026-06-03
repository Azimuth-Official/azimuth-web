import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Azimuth",
    short_name: "Azimuth",
    description:
      "A decentralized positioning and timing network built on signals of opportunity.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0F1E",
    theme_color: "#F59E0B",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
