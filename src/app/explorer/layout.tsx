import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network Explorer | Azimuth",
  description:
    "Explore the Azimuth decentralized positioning network — live node map, signal coverage, and observation data.",
  openGraph: {
    title: "Network Explorer | Azimuth",
    description:
      "Explore the Azimuth decentralized positioning network — live node map, signal coverage, and observation data.",
  },
};

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
