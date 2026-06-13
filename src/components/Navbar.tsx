"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import NavDropdown from "./NavDropdown";

const getStartedItems = [
  { href: "/guides/quickstart", label: "Quick Start" },
  { href: "/guides/tier0-setup", label: "Tier 0 Setup" },
  { href: "/guides/tier2-setup", label: "Tier 2 Setup" },
  { href: "/guides", label: "All Guides" },
];

const learnItems = [
  { href: "/docs", label: "Documentation" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/litepaper", label: "Litepaper" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [mobileGetStarted, setMobileGetStarted] = useState(false);
  const [mobileLearn, setMobileLearn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/web/me")
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/web/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    setIsOpen(false);
  };

  const closeMobile = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <Image src="/logo-horizontal.png" alt="Azimuth" width={108} height={36} unoptimized className="group-hover:scale-105 transition-transform" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center lg:gap-4 xl:gap-8">
          <Link href="/explorer" className="text-slate-400 hover:text-slate-100 transition-colors">Explorer</Link>
          <NavDropdown label="Get Started" items={getStartedItems} />
          <NavDropdown label="Learn" items={learnItems} />
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-100 transition-colors">Dashboard</Link>
        </div>

        {/* Auth State / CTA (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-400 truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg border border-border hover:border-amber-500/50 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Sign in
              </Link>
              <Button href="/download" size="md" variant="primary">
                Download
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex flex-col gap-1 w-8 h-8 items-center justify-center"
        >
          <div className={`w-6 h-0.5 bg-slate-400 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
          <div className={`w-6 h-0.5 bg-slate-400 transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
          <div className={`w-6 h-0.5 bg-slate-400 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            <Link href="/explorer" className="py-2.5 text-slate-400 hover:text-slate-100 transition-colors" onClick={closeMobile}>Explorer</Link>

            {/* Get Started group */}
            <button
              onClick={() => setMobileGetStarted((v) => !v)}
              className="flex items-center justify-between py-2.5 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <span>Get Started</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${mobileGetStarted ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileGetStarted && (
              <div className="flex flex-col gap-1 pl-4 pb-2">
                {getStartedItems.map((item) => (
                  <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-500 hover:text-amber-500 transition-colors" onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Learn group */}
            <button
              onClick={() => setMobileLearn((v) => !v)}
              className="flex items-center justify-between py-2.5 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <span>Learn</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${mobileLearn ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileLearn && (
              <div className="flex flex-col gap-1 pl-4 pb-2">
                {learnItems.map((item) => (
                  <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-500 hover:text-amber-500 transition-colors" onClick={closeMobile}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/dashboard" className="py-2.5 text-slate-400 hover:text-slate-100 transition-colors" onClick={closeMobile}>Dashboard</Link>
            <Link href="/download" className="py-2.5 text-amber-500 hover:text-amber-400 font-medium transition-colors" onClick={closeMobile}>Download</Link>

            {user ? (
              <>
                <div className="h-px bg-border my-2" />
                <div className="text-sm text-slate-400 truncate py-1">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="text-left py-2.5 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-border my-2" />
                <Link href="/login" className="py-2.5 text-amber-500 hover:text-amber-400 font-medium transition-colors" onClick={closeMobile}>Sign in</Link>
                <Button href="/download" size="md" variant="primary" className="w-full justify-center" onClick={closeMobile}>
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
