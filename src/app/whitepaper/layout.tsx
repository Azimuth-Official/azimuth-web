import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "Technical whitepaper for Azimuth Network: a decentralized positioning and timing network built on signals of opportunity.",
  alternates: { canonical: "https://azimuth.day/whitepaper" },
  openGraph: {
    title: "Whitepaper",
    description:
      "Technical whitepaper for Azimuth Network: a decentralized positioning and timing network built on signals of opportunity.",
    url: "https://azimuth.day/whitepaper",
  },
  twitter: {
    title: "Whitepaper",
    description:
      "Technical whitepaper for Azimuth Network: a decentralized positioning and timing network built on signals of opportunity.",
  },
};

const whitepaperJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Azimuth Whitepaper",
  description:
    "Technical specification for a decentralized positioning and timing network built on signals of opportunity.",
  url: "https://azimuth.day/whitepaper",
  author: { "@type": "Organization", name: "Azimuth" },
  publisher: {
    "@type": "Organization",
    name: "Azimuth",
    logo: { "@type": "ImageObject", url: "https://azimuth.day/logo-og.png" },
  },
};

export default function WhitepaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={whitepaperJsonLd} />
      {children}
    </>
  );
}
