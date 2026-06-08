"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

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

  return (
    <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group">
          <Image src="/logo-horizontal.png" alt="Azimuth" width={108} height={36} unoptimized className="group-hover:scale-105 transition-transform" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center lg:gap-4 xl:gap-8">
          <Link href="/" className="text-slate-400 hover:text-slate-100 transition-colors">Home</Link>
          <Link href="/docs" className="text-slate-400 hover:text-slate-100 transition-colors">Docs</Link>
          <Link href="/whitepaper" className="text-slate-400 hover:text-slate-100 transition-colors">Whitepaper</Link>
          <Link href="/litepaper" className="text-slate-400 hover:text-slate-100 transition-colors">Litepaper</Link>
          <Link href="/blog" className="text-slate-400 hover:text-slate-100 transition-colors">Blog</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-100 transition-colors">Dashboard</Link>
          <Link href="/explorer" className="text-slate-400 hover:text-slate-100 transition-colors">Explorer</Link>
          <Link href="/guides" className="text-slate-400 hover:text-slate-100 transition-colors">Setup Guide</Link>
          <Link href="/download" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">Download</Link>
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
              <Button href="/guides" size="md" variant="primary">
                Join the Network
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
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            <Link href="/" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/docs" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Docs</Link>
            <Link href="/whitepaper" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Whitepaper</Link>
            <Link href="/litepaper" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Litepaper</Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Blog</Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link href="/explorer" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Explorer</Link>
            <Link href="/guides" className="text-slate-400 hover:text-slate-100 transition-colors" onClick={() => setIsOpen(false)}>Setup Guide</Link>
            <Link href="/download" className="text-amber-500 hover:text-amber-400 font-medium transition-colors" onClick={() => setIsOpen(false)}>Download</Link>

            {user ? (
              <>
                <div className="h-px bg-border" />
                <div className="text-sm text-slate-400 truncate">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="text-left text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-border" />
                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors" onClick={() => setIsOpen(false)}>Sign in</Link>
                <Button href="/guides" size="md" variant="primary" className="w-full justify-center" onClick={() => setIsOpen(false)}>
                  Join the Network
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
