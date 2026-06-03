import Button from "@/components/Button";
import Card from "@/components/Card";
import SectionHeading from "@/components/SectionHeading";
import SignalWave from "@/components/SignalWave";

export default function Home() {
  return (
    <div className="bg-navy">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <SignalWave />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-surface border border-border rounded-full text-slate-400 text-sm font-medium">
              No license required · Receive-only · Works worldwide
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-100 leading-tight mb-6 animate-fade-in-up">
            Turn Every Radio Signal Into a Position Fix
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Azimuth is a decentralized network of passive SDR receivers that
            listens to existing LTE, 5G, TV, and FM broadcasts to build a global
            positioning and timing layer — without transmitting a single watt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/guides/tier0-setup" size="lg" variant="primary">
              Get the App
            </Button>
            <Button href="/guides/quickstart" size="lg" variant="outline">
              SDR Setup Guide
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-navy">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="How It Works" centered />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Listen */}
            <div className="relative">
              <Card accentTop hover className="text-center">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Listen
                </h3>
                <p className="text-slate-400">
                  Your node passively receives timing signals from cell towers,
                  TV stations, and FM broadcasts already around you.
                </p>
              </Card>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-amber-500/30"></div>
            </div>

            {/* Step 2: Measure */}
            <div className="relative">
              <Card accentTop hover className="text-center">
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Measure
                </h3>
                <p className="text-slate-400">
                  The Azimuth daemon extracts precise timestamps from each
                  signal using Time-Difference-of-Arrival algorithms.
                </p>
              </Card>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-amber-500/30"></div>
            </div>

            {/* Step 3: Earn */}
            <div className="relative">
              <Card accentTop hover className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Earn
                </h3>
                <p className="text-slate-400">
                  Observations flow to the network. Better coverage and uptime
                  mean higher rewards.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Targets Section */}
      <section className="py-24 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Signal Targets" centered />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* LTE/5G */}
            <Card accentTop hover>
              <div className="text-3xl mb-3">📶</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                LTE/5G
              </h3>
              <p className="text-slate-400 text-sm">
                Cell tower reference signals (PSS/SSS/CRS) — broadcasting
                precise timing 24/7
              </p>
            </Card>

            {/* Digital TV */}
            <Card accentTop hover>
              <div className="text-3xl mb-3">📺</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                Digital TV
              </h3>
              <p className="text-slate-400 text-sm">
                High-power DTV pilots covering vast areas with stable,
                predictable timing
              </p>
            </Card>

            {/* FM Radio */}
            <Card accentTop hover>
              <div className="text-3xl mb-3">📻</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                FM Radio
              </h3>
              <p className="text-slate-400 text-sm">
                Ubiquitous FM RDS subcarriers with embedded timing data
              </p>
            </Card>

            {/* LEO Satellites */}
            <Card accentTop hover className="opacity-60">
              <div className="text-3xl mb-3">🛰️</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">
                LEO Satellites
              </h3>
              <p className="text-slate-400 text-sm">
                Coming soon — Starlink and LEO downlinks for sky-ground
                positioning
              </p>
              <div className="mt-3 inline-block px-2 py-1 bg-teal-500/20 text-teal-500 text-xs font-semibold rounded">
                Coming Soon
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Node Tiers Section */}
      <section className="py-24 px-6 bg-navy">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Node Tiers" centered />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tier 0 - Mobile Observer */}
            <div className="relative">
              <Card
                accentTop
                hover
                className="border-2 border-teal-500 relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1/2">
                  <span className="bg-teal-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                    Available at launch
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Tier 0 — Mobile Observer
                </h3>
                <p className="text-amber-500 text-sm font-semibold mb-3">
                  Free
                </p>
                <p className="text-slate-400 mb-4">
                  Run the Azimuth app on your Android phone. Passively collects
                  cell tower, GNSS, and WiFi survey data to build the radio
                  environment map. Zero hardware cost.
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-slate-500 text-sm font-semibold">
                    Your phone is all you need
                  </p>
                </div>
              </Card>
            </div>

            {/* Tier 1 - BYOD */}
            <div className="relative">
              <Card
                accentTop
                hover
                className="border-2 border-amber-500 relative"
              >
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1/2">
                  <span className="bg-teal-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                    Available at launch
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  Tier 1 — BYOD
                </h3>
                <p className="text-amber-500 text-sm font-semibold mb-3">
                  ~$30
                </p>
                <p className="text-slate-400 mb-4">
                  Plug an RTL-SDR V4 dongle into any Windows or Linux
                  machine. Install the Azimuth daemon. Capture SDR signals
                  for higher rewards.
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-slate-500 text-sm font-semibold">
                    Upgrade from Tier 0
                  </p>
                </div>
              </Card>
            </div>

            {/* Tier 2 - Dedicated Node */}
            <Card accentTop hover>
              <div className="mb-3">
                <span className="bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Tier 2 — Dedicated Node
              </h3>
              <p className="text-amber-500 text-sm font-semibold mb-3">
                ~$150–250
              </p>
              <p className="text-slate-400">
                Standalone unit with GPS-disciplined timing, outdoor antenna,
                24/7 operation. Higher rewards.
              </p>
            </Card>

            {/* Tier 3 - Coherent Array */}
            <Card accentTop hover>
              <div className="mb-3">
                <span className="bg-slate-600 text-slate-100 text-xs font-bold px-3 py-1 rounded-full">
                  Future
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                Tier 3 — Coherent Array
              </h3>
              <p className="text-amber-500 text-sm font-semibold mb-3">
                ~$400–600
              </p>
              <p className="text-slate-400">
                Multi-channel coherent SDR with 5-element antenna array. TDOA +
                AoA. Premium tier.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Network Stats Section */}
      <section className="py-24 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto text-center">
          <SectionHeading title="Network Stats" centered />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <p className="text-3xl font-bold text-amber-500">—</p>
              <p className="text-slate-400 text-sm mt-2">Nodes Online</p>
            </Card>
            <Card>
              <p className="text-3xl font-bold text-cyan-500">—</p>
              <p className="text-slate-400 text-sm mt-2">Signals Tracked</p>
            </Card>
            <Card>
              <p className="text-3xl font-bold text-teal-500">—</p>
              <p className="text-slate-400 text-sm mt-2">Countries</p>
            </Card>
            <Card>
              <p className="text-3xl font-bold text-slate-100">—</p>
              <p className="text-slate-400 text-sm mt-2">
                Observations Today
              </p>
            </Card>
          </div>
          <p className="text-slate-400 mt-8 text-center">
            Network launching soon. Live stats coming with mainnet.
          </p>
        </div>
      </section>

      {/* Why Signals-of-Opportunity Section */}
      <section className="py-24 px-6 bg-navy">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
              All the Signals.
              <br />
              <span className="text-amber-500">None of the Licensing.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Traditional positioning needs licensed spectrum and high-power
              transmitters. Azimuth takes the opposite approach — passively
              listening to signals already there. No transmission, no licensing,
              no interference, no regulatory barriers. Deploy anywhere.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold mt-1">✓</span>
                <span className="text-slate-400">
                  Receive-only — no spectrum license needed in any jurisdiction
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold mt-1">✓</span>
                <span className="text-slate-400">
                  Works indoors — LTE and FM penetrate buildings
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold mt-1">✓</span>
                <span className="text-slate-400">
                  GPS-independent — works when satellites are jammed or spoofed
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold mt-1">✓</span>
                <span className="text-slate-400">
                  DePIN-native — the network grows with every node
                </span>
              </li>
            </ul>
          </div>

          {/* Right: Signal Wave Visual */}
          <div className="hidden md:block">
            <div className="h-96 opacity-60">
              <SignalWave />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Join?
          </h2>
          <p className="text-slate-900 text-lg mb-8">
            Start with just your phone — or plug in an SDR dongle for more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/guides/tier0-setup"
              size="lg"
              variant="ghost"
              className="bg-slate-900 text-amber-500 hover:bg-slate-800"
            >
              Get the App (Free)
            </Button>
            <Button
              href="/guides/quickstart"
              size="lg"
              variant="ghost"
              className="bg-slate-900/60 text-amber-500 hover:bg-slate-800/80"
            >
              SDR Setup (~$30)
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
