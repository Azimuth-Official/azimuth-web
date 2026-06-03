import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Updates and insights from the Azimuth project.",
  alternates: { canonical: "https://azimuth.day/blog" },
  openGraph: {
    title: "Blog",
    description: "Updates and insights from the Azimuth project.",
    url: "https://azimuth.day/blog",
  },
  twitter: {
    title: "Blog",
    description: "Updates and insights from the Azimuth project.",
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-navy text-slate-100 min-h-screen">
      <article className="prose prose-invert prose-lg max-w-3xl mx-auto px-6 py-12">{children}</article>
    </div>
  );
}
