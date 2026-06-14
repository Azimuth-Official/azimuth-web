import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step instructions for setting up and running Azimuth nodes.",
  alternates: { canonical: "https://azimuth.day/guides" },
  openGraph: {
    title: "Guides",
    description: "Step-by-step instructions for setting up and running Azimuth nodes.",
    url: "https://azimuth.day/guides",
  },
  twitter: {
    title: "Guides",
    description: "Step-by-step instructions for setting up and running Azimuth nodes.",
  },
};

export default function GuidesIndex() {
  const guides = [
    {
      title: 'Tier 0 — Mobile Observer',
      description: 'Turn your Android phone into an Azimuth node. Zero hardware cost.',
      href: '/guides/tier0-setup',
      badge: 'Available',
      badgeColor: 'bg-teal-500/10 text-teal-500',
    },
    {
      title: 'Tier 1 — BYOD (SDR Dongle)',
      description: 'Get up and running with a $30 SDR dongle in minutes.',
      href: '/guides/quickstart',
      badge: 'Available',
      badgeColor: 'bg-teal-500/10 text-teal-500',
    },
    {
      title: 'Tier 2 — Dedicated Node',
      description: 'Set up a dedicated 24/7 node for higher rewards.',
      href: '/guides/tier2-setup',
      badge: 'Coming soon',
      badgeColor: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Tier 3 — Coherent Array',
      description: 'Deploy a multi-channel SDR array with TDOA and Angle-of-Arrival for maximum rewards.',
      href: '/guides/tier3-setup',
      badge: 'Coming soon',
      badgeColor: 'bg-amber-500/10 text-amber-500',
    },
  ];

  return (
    <div className="not-prose">
      <h1 className="text-4xl font-bold text-slate-100 mb-2">Guides</h1>
      <p className="text-lg text-slate-400 mb-12">
        Step-by-step instructions for setting up and running Azimuth nodes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group bg-surface border border-border rounded-xl p-6 hover:-translate-y-1 transition-all hover:border-amber-500/50"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-100 group-hover:text-amber-500 transition-colors flex-1">
                {guide.title}
              </h3>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-4 ${guide.badgeColor}`}
              >
                {guide.badge}
              </span>
            </div>
            <p className="text-slate-400">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
