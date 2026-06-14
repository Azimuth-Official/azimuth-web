import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Azimuth collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://azimuth.day/privacy' },
  openGraph: {
    title: 'Privacy Policy',
    description: 'How Azimuth collects, uses, and protects your personal information.',
    url: 'https://azimuth.day/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-navy min-h-screen">
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-slate-400 leading-relaxed">
          <section id="overview">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">1. Overview</h2>
            <p>
              Azimuth (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the azimuth.day website and
              related services. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website or use our services, including
              the Azimuth node software and mobile application.
            </p>
          </section>

          <section id="information-collected">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Account Information</h3>
            <p className="mb-4">
              When you create an account, we collect your email address and, if you use Google
              Sign-In, your Google account identifier and display name.
            </p>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Node Observation Data</h3>
            <p className="mb-4">
              Azimuth nodes collect radio frequency observation data including signal timing
              measurements, signal strength, frequency, and approximate geolocation derived from
              the node&apos;s configured H3 hex cell. This data does not contain personal
              communications content &mdash; nodes passively measure broadcast signal timing only.
            </p>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Usage Data</h3>
            <p>
              We automatically collect standard web analytics: IP address, browser type, pages
              visited, and timestamps. We do not use third-party tracking cookies.
            </p>
          </section>

          <section id="use-of-information">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operate and maintain your account and node registration</li>
              <li>Calculate and distribute network rewards</li>
              <li>Build and improve the radio environment map and positioning database</li>
              <li>Communicate service updates and security notices</li>
              <li>Detect and prevent fraud, abuse, or network manipulation</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section id="data-sharing">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share information in these
              circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-200">Aggregated observation data:</strong> Radio environment observations are aggregated and may be made available through the Azimuth data marketplace. Individual node identifiers are not exposed.</li>
              <li><strong className="text-slate-200">Service providers:</strong> We use infrastructure providers (hosting, CDN, database) that process data on our behalf under contractual data protection obligations.</li>
              <li><strong className="text-slate-200">Legal requirements:</strong> We may disclose information when required by law, subpoena, or legal process.</li>
            </ul>
          </section>

          <section id="data-security">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encrypted connections
              (TLS), hashed passwords (bcrypt), HTTP-only session cookies, and access controls.
              No method of transmission over the internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section id="data-retention">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">6. Data Retention</h2>
            <p>
              Account data is retained while your account is active. Node observation data is
              retained indefinitely as part of the network&apos;s positioning database. You may
              request account deletion by contacting us, which will remove your personal
              information but not previously submitted observation data that has been aggregated
              into the network dataset.
            </p>
          </section>

          <section id="your-rights">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">7. Your Rights</h2>
            <p className="mb-4">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at the address in the Contact section below.
            </p>
          </section>

          <section id="children">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect
              personal information from children. If we learn we have collected information from a
              child, we will delete it promptly.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated revision date. Continued use of our services after changes
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">10. Contact</h2>
            <p>
              Questions about this Privacy Policy? Reach us on{' '}
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
