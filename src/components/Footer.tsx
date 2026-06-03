import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Product */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/whitepaper"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link
                  href="/litepaper"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Litepaper
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/quickstart"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Setup Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Azimuth" width={20} height={20} />
            <p className="text-slate-500 text-sm">
              © 2026 Azimuth. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
