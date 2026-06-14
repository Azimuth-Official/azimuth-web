import Button from "@/components/Button";
import Card from "@/components/Card";

export default function LitepaperPage() {
  return (
    <div className="bg-navy min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-sm font-semibold">
              Litepaper
            </span>
            <span className="inline-block px-4 py-2 bg-surface border border-border rounded-full text-slate-400 text-sm font-medium">
              5-minute read
            </span>
            <span className="inline-block px-4 py-2 bg-surface border border-border rounded-full text-slate-400 text-sm font-medium">
              No license required
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6">
            GPS is fragile.
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-teal-500 bg-clip-text text-transparent">
              The fix is already in the air.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Azimuth is a decentralized network of passive receivers that turns existing
            cell tower, TV, and FM broadcasts into a GPS-independent positioning layer.
            No transmitting. No licensing. Just listening.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/guides/quickstart" size="lg" variant="primary">
              Start a Node
            </Button>
            <Button href="/whitepaper" size="lg" variant="outline">
              Full Whitepaper →
            </Button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-amber-500 text-sm mb-2">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
            The world runs on a signal weaker than Wi-Fi — by a factor of 20 billion
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed mb-12">
            <p>
              GPS underpins air traffic control, financial timestamps, power grids,
              autonomous vehicles, and the daily lives of billions. The signal arriving
              at your phone is 10⁻¹⁶ watts. A $30 jammer kills it across a city block.
              Spoofing diverts aircraft across hundreds of kilometers. Indoors, it
              doesn&apos;t work at all.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-t-2 border-t-red-500">
              <p className="text-3xl font-bold text-red-500">$1B</p>
              <p className="text-slate-400 text-sm mt-2">
                Estimated daily cost of a US GPS outage (NIST, 2019)
              </p>
            </Card>
            <Card className="border-t-2 border-t-red-500">
              <p className="text-3xl font-bold text-red-500">$30</p>
              <p className="text-slate-400 text-sm mt-2">
                Cost of a jammer that denies GPS across a city block
              </p>
            </Card>
            <Card className="border-t-2 border-t-red-500">
              <p className="text-3xl font-bold text-red-500">0%</p>
              <p className="text-slate-400 text-sm mt-2">
                GPS signal available indoors, underground, or in urban canyons
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Not Build New Transmitters? */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-amber-500 text-sm mb-2">Why Not Build New Transmitters?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
            Because regulations and physics won&apos;t let you
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            The obvious alternative — decentralized ground-based transmitters at low
            frequency — fails on three fronts: regulatory incompatibility across
            jurisdictions, catastrophic antenna inefficiency at permitted sizes, and
            positioning precision three orders of magnitude worse than GPS.
          </p>

          {/* Comparison Grid */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden mb-10">
            <div className="grid grid-cols-3 gap-px bg-border">
              <div className="bg-surface-alt p-4">
                <p className="text-slate-500 text-sm font-semibold">Factor</p>
              </div>
              <div className="bg-surface-alt p-4">
                <p className="text-slate-500 text-sm font-semibold">LF Transmitter DePIN</p>
              </div>
              <div className="bg-surface-alt p-4">
                <p className="text-slate-500 text-sm font-semibold">Azimuth (SoOP)</p>
              </div>
            </div>
            {[
              ["License needed?", "Varies by country", "Never — receive-only"],
              ["Works in US + EU?", "No — EU bans radiating", "Yes — all jurisdictions"],
              ["Antenna efficiency", "~0.1%", ">90%"],
              ["Useful bandwidth", "10 kHz", "10–400 MHz"],
              ["Position accuracy", "~300 m – 3 km", "10–100 m, improving"],
              ["Nodes for US coverage", "4–8 million", "~10,000"],
            ].map(([factor, bad, good], i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-surface p-4">
                  <p className="text-slate-300 text-sm">{factor}</p>
                </div>
                <div className="bg-surface p-4">
                  <p className="text-red-400 text-sm">{bad}</p>
                </div>
                <div className="bg-surface p-4">
                  <p className="text-teal-400 text-sm">{good}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border-l-4 border-teal-500 p-6 rounded-r-lg">
            <p className="text-teal-400 font-semibold text-sm mb-2">Key Insight</p>
            <p className="text-slate-400 leading-relaxed">
              The signals you need for positioning are already everywhere — cell towers,
              TV stations, and FM transmitters blanket the world at power levels 60–100 dB
              stronger than GPS. The missing piece isn&apos;t the signal. It&apos;s the
              network of receivers.
            </p>
          </div>
        </div>
      </section>

      {/* How Azimuth Works */}
      <section className="py-16 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-amber-500 text-sm mb-2">How Azimuth Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
            Listen. Measure. Position.
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Azimuth nodes passively receive timing data from broadcasts already in the
            air. Multiple signal types are fused for accuracy and coverage no single
            source can match.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card accentTop hover className="text-center">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Listen</h3>
              <p className="text-slate-400 text-sm">
                Your SDR node passively receives LTE, 5G, digital TV, and FM
                broadcasts — all carrying precise timing information.
              </p>
            </Card>
            <Card accentTop hover className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Measure</h3>
              <p className="text-slate-400 text-sm">
                The daemon extracts timestamps via TDOA algorithms and builds a
                radio fingerprint of your location&apos;s signal environment.
              </p>
            </Card>
            <Card accentTop hover className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Earn</h3>
              <p className="text-slate-400 text-sm">
                Observations flow to the network. Better coverage, more signals,
                and higher uptime earn more rewards through Proof of Observation.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-t-2 border-t-teal-500 text-center">
              <p className="text-3xl font-bold text-teal-500">4</p>
              <p className="text-slate-400 text-sm mt-2">
                Signal classes: LTE/5G, DTV, FM, LEO satellites
              </p>
            </Card>
            <Card className="border-t-2 border-t-teal-500 text-center">
              <p className="text-3xl font-bold text-teal-500">0 W</p>
              <p className="text-slate-400 text-sm mt-2">
                Transmitted power — purely passive, zero interference
              </p>
            </Card>
            <Card className="border-t-2 border-t-teal-500 text-center">
              <p className="text-3xl font-bold text-teal-500">∞</p>
              <p className="text-slate-400 text-sm mt-2">
                Jurisdictions where receive-only is legal (all of them)
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Node Tiers */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-amber-500 text-sm mb-2">Node Tiers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
            Start with $30. Scale from there.
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Four hardware tiers let you enter at any level — starting at zero cost. Every tier earns;
            higher tiers produce higher-quality data and earn proportionally more.
          </p>

          <div className="space-y-0 divide-y divide-border">
            <div className="flex flex-col md:flex-row gap-6 py-8 first:pt-0">
              <div className="md:w-48 flex-shrink-0">
                <p className="text-2xl font-bold text-teal-500">Free</p>
                <p className="text-slate-100 font-semibold">Tier 0 — Mobile</p>
              </div>
              <div>
                <p className="text-slate-100 font-semibold mb-2">Android Observer App</p>
                <p className="text-slate-400">
                  Turn your existing Android phone into an Azimuth node at zero cost.
                  Collects cell tower survey data, GNSS measurements, and WiFi signals.{' '}
                  <a href="/download" className="text-amber-500 hover:text-amber-400">Download the APK</a>.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 py-8">
              <div className="md:w-48 flex-shrink-0">
                <p className="text-2xl font-bold text-amber-500">$30</p>
                <p className="text-slate-100 font-semibold">Tier 1 — BYOD</p>
              </div>
              <div>
                <p className="text-slate-100 font-semibold mb-2">RTL-SDR V4 Dongle</p>
                <p className="text-slate-400">
                  Plug into any PC. Install the daemon. Start earning. Covers 500 kHz
                  to 1.7 GHz — enough for LTE, FM, and DTV signals. NTP timing.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 py-8">
              <div className="md:w-48 flex-shrink-0">
                <p className="text-2xl font-bold text-amber-500">~$200</p>
                <p className="text-slate-100 font-semibold">Tier 2 — Dedicated</p>
                <span className="inline-block mt-2 px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded">
                  Coming Soon
                </span>
              </div>
              <div>
                <p className="text-slate-100 font-semibold mb-2">GPS-Disciplined Standalone</p>
                <p className="text-slate-400">
                  Purpose-built unit with nanosecond-class timing, outdoor antenna,
                  and 24/7 unattended operation. Higher data quality, higher rewards.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 py-8">
              <div className="md:w-48 flex-shrink-0">
                <p className="text-2xl font-bold text-amber-500">~$500</p>
                <p className="text-slate-100 font-semibold">Tier 3 — Array</p>
                <span className="inline-block mt-2 px-2 py-1 bg-slate-600/20 text-slate-400 text-xs font-semibold rounded">
                  Future
                </span>
              </div>
              <div>
                <p className="text-slate-100 font-semibold mb-2">Multi-Channel Coherent SDR</p>
                <p className="text-slate-400">
                  5-element antenna array with TDOA + Angle-of-Arrival capability.
                  Interferometric direction-finding. Premium tier rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Economy */}
      <section className="py-16 px-6 bg-surface/50">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-amber-500 text-sm mb-2">Token Economy</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
            Earn by observing. Spend by querying.
          </h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            The Azimuth token connects node operators who generate data with
            applications that consume it. Proof of Observation rewards useful
            work — real radio measurements that make the network more accurate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="border-t-2 border-t-teal-500">
              <h3 className="text-xl font-bold text-teal-500 mb-3">Earn</h3>
              <p className="text-slate-400">
                Node operators earn tokens for verified signal observations.
                Rewards scale with coverage value, signal diversity, timing
                quality, and uptime.
              </p>
            </Card>
            <Card className="border-t-2 border-t-amber-500">
              <h3 className="text-xl font-bold text-amber-500 mb-3">Spend</h3>
              <p className="text-slate-400">
                Apps query the network for positioning fixes, radio environment
                maps, GNSS integrity monitoring, and historical signal data.
              </p>
            </Card>
          </div>

          <p className="text-slate-400 leading-relaxed mb-10">
            Nodes in underserved areas earn more — your value to the network is
            defined by where you are, not just what hardware you run. Unlike storage
            or bandwidth DePINs, positioning nodes are geographically irreplaceable.
          </p>

          {/* Reward Mechanics */}
          <div className="border-t border-border pt-10">
            <h3 className="text-2xl font-bold text-slate-100 mb-6">Reward Mechanics</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Rewards are calculated per epoch using multiplicative factors that balance
              geographic expansion, data quality, and fair distribution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Base Points</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Each tier earns fixed base points per epoch:
                </p>
                <div className="flex gap-3 text-center">
                  <div className="flex-1 bg-navy rounded-lg p-3">
                    <p className="text-xs text-slate-500">T0</p>
                    <p className="text-xl font-bold text-teal-500">1</p>
                  </div>
                  <div className="flex-1 bg-navy rounded-lg p-3">
                    <p className="text-xs text-slate-500">T1</p>
                    <p className="text-xl font-bold text-amber-500">3</p>
                  </div>
                  <div className="flex-1 bg-navy rounded-lg p-3">
                    <p className="text-xs text-slate-500">T2</p>
                    <p className="text-xl font-bold text-amber-500">8</p>
                  </div>
                  <div className="flex-1 bg-navy rounded-lg p-3">
                    <p className="text-xs text-slate-500">T3</p>
                    <p className="text-xl font-bold text-amber-500">15</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Hex Freshness</h4>
                <p className="text-slate-400 text-sm">
                  First to observe a new H3 hex? Earn up to 3&times; base. Saturated hexes
                  drop to 0.1&times;. The network rewards explorers, not followers.
                </p>
              </Card>
              <Card>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Saturation &amp; Density</h4>
                <p className="text-slate-400 text-sm">
                  Per-node rewards decay logarithmically as more nodes join a hex. Hard cap
                  at 10 nodes per hex &mdash; beyond that, additional nodes earn zero. Growth
                  goes outward, not inward.
                </p>
              </Card>
              <Card>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Collision &amp; RTK</h4>
                <p className="text-slate-400 text-sm">
                  30-minute latecomer suppression prevents reward sniping. Nodes with RTK
                  GNSS (centimeter-level self-positioning) earn a 1.5&times; bonus on all
                  observations.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            The signals are already there.
            <br />
            Azimuth listens.
          </h2>
          <p className="text-slate-900 text-lg mb-8">
            All you need is an RTL-SDR dongle and a computer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/guides/quickstart"
              size="lg"
              variant="ghost"
              className="bg-slate-900 text-amber-500 hover:bg-slate-800"
            >
              Get Started
            </Button>
            <Button
              href="/whitepaper"
              size="lg"
              variant="ghost"
              className="border border-slate-900 text-slate-900 hover:bg-amber-600"
            >
              Full Whitepaper →
            </Button>
            <Button
              href="/docs"
              size="lg"
              variant="ghost"
              className="border border-slate-900 text-slate-900 hover:bg-amber-600"
            >
              Documentation →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
