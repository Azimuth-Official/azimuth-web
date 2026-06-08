import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Azimuth",
  description: "Sign in to your Azimuth dashboard to monitor nodes and rewards.",
  alternates: { canonical: "https://azimuth.day/login" },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
