'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/docs', label: 'Overview' },
    { href: '/docs/architecture', label: 'Architecture' },
    { href: '/docs/signals', label: 'Signal Targets' },
    { href: '/docs/tokenomics', label: 'Tokenomics' },
    { href: '/docs/faq', label: 'FAQ' },
  ];

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Desktop sidebar (full-height bg column + sticky nav) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-surface border-r border-border">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Docs</h2>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-amber-500 hover:bg-surface-alt"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar (fixed slide-in) */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-surface border-r border-border transform transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Docs</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-amber-500 hover:bg-surface-alt"
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center border-b border-border bg-surface px-6 py-4 lg:hidden">
          <button
            className="flex items-center gap-2"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-slate-100">Menu</span>
          </button>
        </div>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
