import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Litepaper",
  description:
    "Azimuth in 5 minutes: a decentralized network of passive receivers building GPS-independent positioning from signals already in the air.",
  alternates: { canonical: "https://azimuth.day/litepaper" },
  openGraph: {
    title: "Litepaper",
    description:
      "Azimuth in 5 minutes: a decentralized network of passive receivers building GPS-independent positioning from signals already in the air.",
    url: "https://azimuth.day/litepaper",
  },
  twitter: {
    title: "Litepaper",
    description:
      "Azimuth in 5 minutes: a decentralized network of passive receivers building GPS-independent positioning from signals already in the air.",
  },
};

const litepaperJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Azimuth Litepaper",
  description:
    "A decentralized network of passive receivers building GPS-independent positioning from signals already in the air.",
  url: "https://azimuth.day/litepaper",
  author: { "@type": "Organization", name: "Azimuth" },
  publisher: {
    "@type": "Organization",
    name: "Azimuth",
    logo: { "@type": "ImageObject", url: "https://azimuth.day/logo-og.png" },
  },
};

export default function LitepaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={litepaperJsonLd} />
      {children}
    </>
  );
}
