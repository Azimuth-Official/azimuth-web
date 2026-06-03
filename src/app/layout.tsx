import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://azimuth.day"),
  title: {
    default: "Azimuth — Decentralized Positioning & Timing",
    template: "%s | Azimuth",
  },
  description:
    "A DePIN of passive SDR receivers building a global positioning layer from signals of opportunity.",
  alternates: { canonical: "https://azimuth.day" },
  openGraph: {
    title: "Azimuth — Decentralized Positioning & Timing",
    description:
      "A DePIN of passive SDR receivers building a global positioning layer from signals of opportunity.",
    siteName: "Azimuth",
    locale: "en_US",
    type: "website",
    url: "https://azimuth.day",
    images: [{ url: "/logo-og.png", width: 1200, height: 630, alt: "Azimuth" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azimuth — Decentralized Positioning & Timing",
    description:
      "A DePIN of passive SDR receivers building a global positioning layer from signals of opportunity.",
    images: ["/logo-og.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Azimuth",
      url: "https://azimuth.day",
      logo: "https://azimuth.day/logo-og.png",
      description:
        "A decentralized positioning and timing network built on signals of opportunity.",
      sameAs: [
        "https://github.com/Azimuth-Official",
        "https://x.com/AzimuthDePIN",
        "https://discord.gg/P5jfybTx",
      ],
    },
    {
      "@type": "WebSite",
      name: "Azimuth",
      url: "https://azimuth.day",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <JsonLd data={organizationJsonLd} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
