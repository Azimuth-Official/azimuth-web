import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Azimuth uses cookies and similar technologies.',
  alternates: { canonical: 'https://azimuth.day/cookies' },
  openGraph: {
    title: 'Cookie Policy',
    description: 'How Azimuth uses cookies and similar technologies.',
    url: 'https://azimuth.day/cookies',
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-navy min-h-screen">
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Cookie Policy</h1>
          <p className="text-sm text-slate-500">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-slate-400 leading-relaxed">
          <section id="what-are-cookies">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They
              help the site remember your preferences and enable core functionality. This policy
              explains what cookies azimuth.day uses and why.
            </p>
          </section>

          <section id="cookies-we-use">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">2. Cookies We Use</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-slate-200 font-medium">Cookie</th>
                    <th className="text-left py-3 pr-4 text-slate-200 font-medium">Purpose</th>
                    <th className="text-left py-3 pr-4 text-slate-200 font-medium">Duration</th>
                    <th className="text-left py-3 text-slate-200 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-xs text-amber-500">azimuth_session</td>
                    <td className="py-3 pr-4">Keeps you signed in. Contains an encrypted session token.</td>
                    <td className="py-3 pr-4">7 days</td>
                    <td className="py-3">Essential</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-xs text-amber-500">cf_clearance</td>
                    <td className="py-3 pr-4">Cloudflare Turnstile CAPTCHA verification for the daily claim flow.</td>
                    <td className="py-3 pr-4">30 minutes</td>
                    <td className="py-3">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="no-tracking">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">3. No Tracking Cookies</h2>
            <p>
              Azimuth does not use advertising cookies, social media tracking pixels, or
              third-party analytics cookies. We do not track you across other websites. We do
              not sell cookie data to third parties.
            </p>
          </section>

          <section id="third-party">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              When you use Google Sign-In, Google may set cookies as part of its authentication
              flow. These cookies are governed by{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">
                Google&apos;s Privacy Policy
              </a>.
            </p>
            <p>
              Our CDN provider (Bunny.net) may set minimal cookies for DDoS protection and
              performance optimization. These are strictly functional and do not track users.
            </p>
          </section>

          <section id="managing-cookies">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">5. Managing Cookies</h2>
            <p className="mb-4">
              You can control cookies through your browser settings. Most browsers allow you to
              block or delete cookies. However, blocking essential cookies will prevent you from
              signing in to your Azimuth account.
            </p>
            <p>Common browser cookie settings:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Chrome: Settings &rarr; Privacy and security &rarr; Cookies</li>
              <li>Firefox: Settings &rarr; Privacy &amp; Security &rarr; Cookies</li>
              <li>Safari: Preferences &rarr; Privacy</li>
              <li>Edge: Settings &rarr; Cookies and site permissions</li>
            </ul>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">6. Changes to This Policy</h2>
            <p>
              If we add new cookies or change how existing cookies work, we will update this page.
              Essential cookies may be updated without notice; any non-essential cookies will
              require renewed consent.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">7. Contact</h2>
            <p>
              Questions about cookies? Reach us on{' '}
              <a href="https://discord.gg/3Da6xEWWTq" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">Discord</a>{' '}
              or{' '}
              <a href="https://x.com/AzimuthDePIN" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">Twitter/X</a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">&larr; Back to home</Link>
        </div>
      </main>
    </div>
  );
}
