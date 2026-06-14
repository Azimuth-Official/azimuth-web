import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Azimuth services.',
  alternates: { canonical: 'https://azimuth.day/terms' },
  openGraph: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using Azimuth services.',
    url: 'https://azimuth.day/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-navy min-h-screen">
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: June 2026</p>
        </div>

        <div className="space-y-10 text-slate-400 leading-relaxed">
          <section id="acceptance">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using azimuth.day, the Azimuth node software, or any related
              services (collectively, the &ldquo;Services&rdquo;), you agree to be bound by these Terms of
              Service. If you do not agree, do not use the Services.
            </p>
          </section>

          <section id="eligibility">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use the Services. By using the Services, you
              represent that you meet this requirement and have the legal capacity to enter into
              these Terms.
            </p>
          </section>

          <section id="accounts">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">3. Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the security of your account credentials. You
              agree to notify us immediately of any unauthorized access. We are not liable for
              losses resulting from unauthorized use of your account.
            </p>
            <p>
              You may not create multiple accounts for the purpose of manipulating network rewards
              or circumventing density caps.
            </p>
          </section>

          <section id="node-operation">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">4. Node Operation</h2>
            <p className="mb-4">
              By operating an Azimuth node, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate geolocation information for your node&apos;s H3 hex cell</li>
              <li>Not submit fabricated, manipulated, or spoofed observation data</li>
              <li>Not operate nodes in a manner that violates local radio frequency regulations</li>
              <li>Accept that Azimuth nodes operate in receive-only mode and do not transmit radio signals</li>
              <li>Comply with all applicable laws regarding the use of software-defined radio equipment in your jurisdiction</li>
            </ul>
          </section>

          <section id="rewards">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">5. Rewards</h2>
            <p className="mb-4">
              Network rewards are distributed based on observation data quality, geographic
              coverage, node tier, and other factors as described in the whitepaper. Reward
              parameters (base points, multipliers, decay rates) may be adjusted by the Azimuth
              team to maintain network health and incentive alignment.
            </p>
            <p>
              Rewards are not guaranteed. The Azimuth team reserves the right to withhold rewards
              from nodes engaged in manipulation, Sybil attacks, data fabrication, or any behavior
              that undermines network integrity.
            </p>
          </section>

          <section id="intellectual-property">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">6. Intellectual Property</h2>
            <p>
              The Azimuth software, website content, documentation, and brand assets are owned by
              the Azimuth team and protected by intellectual property laws. The node software is
              provided under the terms specified in its license file.
            </p>
          </section>

          <section id="data-license">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">7. Data License</h2>
            <p>
              By submitting observation data through the Azimuth node software, you grant
              Azimuth a perpetual, irrevocable, worldwide license to use, aggregate, process,
              and distribute that data as part of the network&apos;s positioning and timing database.
              Individual observation data is aggregated and anonymized before inclusion in the
              data marketplace.
            </p>
          </section>

          <section id="disclaimers">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">8. Disclaimers</h2>
            <p className="mb-4">
              THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY
              KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              Azimuth does not guarantee the accuracy, completeness, or reliability of positioning
              data derived from the network. The Services should not be relied upon for
              safety-critical applications without independent verification.
            </p>
          </section>

          <section id="limitation">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AZIMUTH SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS
              OF PROFITS, DATA, OR REWARDS, ARISING FROM YOUR USE OF THE SERVICES.
            </p>
          </section>

          <section id="termination">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any time for violation of
              these Terms, network manipulation, or any other reason at our discretion. You may
              stop using the Services at any time by deactivating your node and closing your
              account.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Changes will be posted on this page with an
              updated date. Continued use of the Services after changes constitutes acceptance of
              the revised Terms.
            </p>
          </section>

          <section id="governing-law">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">12. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable law, without
              regard to conflict of law principles.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">13. Contact</h2>
            <p>
              Questions about these Terms? Reach us on{' '}
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
