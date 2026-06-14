'use client';

import { useState, useEffect } from 'react';

const tocItems = [
  { id: 'abstract', label: 'Abstract', indent: 0 },
  { id: 'problem', label: '1  The Problem', indent: 0 },
  { id: 'why-alternatives-fail', label: '2  Why Alternatives Fail', indent: 0 },
  { id: 'regulatory-landscape', label: '2.1  Regulatory Landscape', indent: 1 },
  { id: 'antenna-physics', label: '2.2  Antenna Physics', indent: 1 },
  { id: 'tdoa-precision', label: '2.3  TDOA Precision Limits', indent: 1 },
  { id: 'sync-paradox', label: '2.4  Synchronization Paradox', indent: 1 },
  { id: 'soop', label: '3  Signals of Opportunity', indent: 0 },
  { id: 'architecture', label: '4  Architecture', indent: 0 },
  { id: 'signal-targets', label: '4.1  Signal Targets', indent: 1 },
  { id: 'node-tiers', label: '4.2  Node Tiers', indent: 1 },
  { id: 'positioning-engine', label: '4.3  Positioning Engine', indent: 1 },
  { id: 'depin-model', label: '5  The DePIN Model', indent: 0 },
  { id: 'tokenomics', label: '6  Tokenomics', indent: 0 },
  { id: 'proof-of-observation', label: '6.1  Proof of Observation', indent: 1 },
  { id: 'reward-factors', label: '6.2  Reward Factors', indent: 1 },
  { id: 'reward-mechanics', label: '6.3  Reward Mechanics', indent: 1 },
  { id: 'data-marketplace', label: '6.4  Data Marketplace', indent: 1 },
  { id: 'roadmap', label: '7  Roadmap', indent: 0 },
  { id: 'conclusion', label: '8  Conclusion', indent: 0 },
  { id: 'references', label: 'References', indent: 0 },
];

export default function WhitepaperPage() {
  const [activeSection, setActiveSection] = useState('abstract');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );

    for (const { id } of tocItems) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-navy min-h-screen">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-12 pr-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Contents
            </p>
            <nav className="space-y-0.5">
              {tocItems.map(({ id, label, indent }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block text-sm py-1 transition-colors ${
                    indent ? 'pl-4 text-xs' : ''
                  } ${
                    activeSection === id
                      ? 'text-amber-500 font-medium'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 py-12 px-6 lg:px-12 max-w-4xl">
          {/* Hero */}
          <div className="mb-16">
            <span className="inline-block px-4 py-2 bg-surface border border-border rounded-full text-slate-400 text-sm font-medium mb-6">
              Whitepaper v1.0
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 leading-tight mb-6">
              Decentralized Positioning &amp; Timing from Signals of Opportunity
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-6">
              A passive, receive-only DePIN architecture that turns existing radio broadcasts
              into a global positioning layer — without transmitting a single watt, without any
              spectrum license, in any jurisdiction.
            </p>
            <p className="text-sm text-slate-500 font-mono">
              Azimuth Network · June 2026 · v1.0
            </p>
            <div className="mt-8 h-px bg-border" />
          </div>

          {/* Abstract */}
          <section id="abstract" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">00</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Abstract</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                Global Navigation Satellite Systems are a single point of failure for modern
                civilization. GPS, GLONASS, Galileo, and BeiDou operate from medium Earth orbit
                on weak signals that are trivially jammed and increasingly spoofed. Every proposed
                terrestrial alternative based on purpose-built low-frequency transmitters runs into
                the same wall: the regulations that govern license-free spectrum make useful
                positioning physically impossible at permitted power levels, and the jurisdictions
                that matter most — the US, Canada, UK, and EU — do not even agree on whether
                radiating transmission is allowed below 1 MHz.
              </p>
              <p>
                Azimuth takes a fundamentally different approach. Instead of building new
                transmitters, the network deploys passive software-defined radio receivers that
                listen to signals already saturating the radio environment — LTE and 5G cell tower
                reference signals, digital television pilots, FM radio subcarriers, and LEO
                satellite downlinks. These signals were designed for communication, but they carry
                precise timing information that can be repurposed for positioning through
                Time-Difference-of-Arrival computation and signal fingerprinting. Because Azimuth
                nodes only receive, they require no spectrum license in any jurisdiction on Earth.
              </p>
              <p>
                This whitepaper presents the technical foundations, regulatory analysis, network
                architecture, and economic model for Azimuth — a Decentralized Physical
                Infrastructure Network that crowdsources positioning and timing from the signals
                that are already there.
              </p>
            </div>
          </section>

          {/* 1. The Problem */}
          <section id="problem" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">01</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">The Problem</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                GPS was designed in the 1970s for military navigation. Today it underpins civilian
                air traffic control, financial transaction timestamps, power grid synchronization,
                autonomous vehicles, precision agriculture, emergency response dispatch, cellular
                network timing, and the daily lives of billions. A system designed for one purpose
                has become the invisible substrate of modern infrastructure — and it is remarkably
                fragile.
              </p>
              <p>
                The signal arriving at a GPS receiver is roughly 10⁻¹⁶ watts — twenty billion
                times weaker than a typical Wi-Fi signal. A $30 jammer purchased online can deny
                GPS coverage across an entire city block. State-level actors routinely spoof GPS in
                conflict zones, diverting aircraft and disrupting maritime navigation across
                hundreds of kilometers. Indoor environments, urban canyons, and underground spaces
                receive no usable GPS signal at all.
              </p>
              <p>
                The economic exposure is staggering. A 2019 RTI International study commissioned by
                NIST estimated that a sustained GPS outage would cost the United States alone $1
                billion per day, with cascading effects across telecommunications, finance,
                agriculture, and emergency services. The EU&apos;s 2023 PNT resilience assessment
                reached similar conclusions for European infrastructure.
              </p>

              {/* Callout — warning */}
              <div className="bg-surface border-l-4 border-amber-500 p-6 rounded-r-lg my-8">
                <p className="text-amber-500 font-semibold text-sm mb-2">The Core Vulnerability</p>
                <p className="text-slate-400">
                  Every GNSS constellation shares the same failure mode: weak signals from 20,000+
                  km away, passing through atmosphere and urban environments to reach receivers at
                  power levels indistinguishable from noise. No amount of satellite redundancy fixes
                  the physics of the downlink.
                </p>
              </div>

              <p>
                The question is not whether GNSS-independent positioning is needed — governments and
                researchers unanimously agree it is. The question is what architecture can deliver it
                at scale. Azimuth argues that the answer is not building new transmitters, but
                intelligently exploiting the transmitters that already exist.
              </p>
            </div>
          </section>

          {/* 2. Why Existing Alternatives Fail */}
          <section id="why-alternatives-fail" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">02</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">
              Why Existing Alternatives Fail
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              The most intuitive alternative to satellite positioning is terrestrial transmission at
              low frequencies, where radio waves follow the Earth&apos;s curvature for hundreds or
              thousands of kilometers. This is the principle behind LORAN-C, eLoran, and time-signal
              stations like WWVB and DCF77. Several projects — including DePIN proposals — have
              attempted to build decentralized, license-free versions of these systems. They all fail
              for the same interconnected reasons.
            </p>

            {/* 2.1 */}
            <div id="regulatory-landscape" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                2.1 The Regulatory Landscape Splits the World in Two
              </h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  The four jurisdictions most relevant to any global positioning system — the United
                  States, Canada, the United Kingdom, and the European Union — take irreconcilable
                  approaches to license-free transmission below 1 MHz.
                </p>
                <p>
                  The US and Canada offer a near-identical &ldquo;LowFER&rdquo; allocation at
                  160–190 kHz: 1 watt DC input to the final RF stage, with the total antenna plus
                  transmission line capped at 15 meters. Within the band, these rules permit
                  radiating transmission — electromagnetic waves propagating into the far field.
                </p>
                <p>
                  The UK and EU take the opposite approach. Under Ofcom IR 2030 and ERC
                  Recommendation 70-03 Annex 9, every license-exempt sub-1.6 MHz allocation is
                  explicitly inductive — restricted to loop coil antennas for near-field magnetic
                  coupling. Field-strength limits are specified in dBµA/m at 10 meters, deep within
                  the reactive near field at LF wavelengths. The regulation does not merely
                  discourage far-field propagation; it is engineered to prevent it.
                </p>
              </div>

              {/* Table */}
              <div className="my-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Jurisdiction</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Best LF/MF Option</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Power / Field Limit</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Antenna</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Radiating?</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">US (FCC § 15.217)</td>
                      <td className="py-3 px-4">160–190 kHz</td>
                      <td className="py-3 px-4">1 W DC input</td>
                      <td className="py-3 px-4">15 m total</td>
                      <td className="py-3 px-4 text-teal-500 font-medium">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Canada (RSS-210 § B.1)</td>
                      <td className="py-3 px-4">160–190 kHz</td>
                      <td className="py-3 px-4">1 W DC input</td>
                      <td className="py-3 px-4">15 m total</td>
                      <td className="py-3 px-4 text-teal-500 font-medium">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">UK (Ofcom IR 2030)</td>
                      <td className="py-3 px-4">119–135 kHz</td>
                      <td className="py-3 px-4">66 dBµA/m @ 10 m</td>
                      <td className="py-3 px-4">Loop coil only</td>
                      <td className="py-3 px-4 text-red-400 font-medium">No</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">EU (ERC 70-03 Annex 9)</td>
                      <td className="py-3 px-4">119–135 kHz</td>
                      <td className="py-3 px-4">66 dBµA/m @ 10 m</td>
                      <td className="py-3 px-4">Loop coil only</td>
                      <td className="py-3 px-4 text-red-400 font-medium">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-slate-400 leading-relaxed">
                There is no frequency below 1 MHz where all four jurisdictions permit license-exempt
                radiating transmission at power levels useful for ground-wave positioning. The
                amateur 2200-meter and 630-meter bands exist but require individual licensing and
                utility-company registration — categorically incompatible with a permissionless
                DePIN deployment.
              </p>
            </div>

            {/* 2.2 */}
            <div id="antenna-physics" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                2.2 Antenna Physics Is the Binding Constraint
              </h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Even where LowFER rules permit radiating transmission, the antenna size limit
                  makes useful range physically impossible. At 175 kHz the wavelength is 1,714
                  meters. A 15-meter antenna is 1/114th of a wavelength — a vanishingly small
                  radiator. The radiation resistance of such a short monopole is roughly 30
                  milliohms, while real-world ground and loading-coil losses run 10–50 ohms.
                </p>

                {/* Equation block */}
                <div className="bg-surface border border-border rounded-xl p-6 my-8 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Radiation Efficiency</p>
                  <p className="font-mono text-amber-500 text-lg">
                    η = R<sub>rad</sub> / (R<sub>rad</sub> + R<sub>loss</sub>) ≈ 0.03 Ω / 30 Ω ≈ 0.1%
                  </p>
                </div>

                <p>
                  A perfectly engineered Part 15 LowFER station radiates approximately 1–5
                  milliwatts of effective isotropic radiated power. Documented reception ranges under
                  real-time ground-wave conditions are 20–100 km in quiet rural areas, collapsing to
                  1–20 km in suburban environments. The transcontinental receptions celebrated in the
                  LowFER community are nighttime skywave detections using deep signal integration
                  over minutes — impossible to use for real-time positioning.
                </p>
                <p>
                  For context, every operational LF positioning or timing system — LORAN-C, eLoran,
                  WWVB, DCF77 — operates between 60 and 100 kHz at 30 kilowatts to 1 megawatt of
                  effective radiated power. That is 80–100 dB more power than a Part 15 station.
                  Better signal processing helps, but it cannot bridge ten orders of magnitude.
                </p>
              </div>
            </div>

            {/* 2.3 */}
            <div id="tdoa-precision" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                2.3 TDOA Precision Limits
              </h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Meter-class positioning requires sub-3-nanosecond timing resolution (the speed of
                  light gives the conversion: 1 ns corresponds to 30 cm). The Cramér–Rao lower bound
                  on TDOA precision is dominated by bandwidth:
                </p>

                {/* Equation block */}
                <div className="bg-surface border border-border rounded-xl p-6 my-8 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Cramér–Rao Bound on Time-of-Arrival
                  </p>
                  <p className="font-mono text-amber-500 text-lg">
                    σ<sub>τ</sub> ≥ 1 / (2π · β<sub>rms</sub> · √(2·B·T·SNR))
                  </p>
                </div>

                <p>
                  A LowFER antenna with a Q of approximately 18 caps usable bandwidth at roughly 10
                  kHz. This sets a fundamental precision floor near 1 microsecond — equivalent to
                  approximately 300 meters of position error per range measurement, even at high SNR.
                  The LF noise floor is dominated by atmospheric sources (primarily lightning), not
                  thermal noise, so adding more nodes does not lower it.
                </p>
                <p>
                  LORAN-C achieved 100-meter accuracy with 20 kHz of bandwidth at 100 kHz center
                  frequency, backed by 250-kilowatt transmitters and continent-scale baselines.
                  eLoran pushed this to 8–20 meters using surveyed additional secondary factor maps.
                  A milliwatt DePIN node with a 10 kHz bandwidth cannot approach either figure.
                </p>
              </div>
            </div>

            {/* 2.4 */}
            <div id="sync-paradox" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                2.4 The Synchronization Paradox
              </h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  A TDOA positioning network requires transmitter clocks synchronized to roughly 1
                  nanosecond. There are exactly three ways to achieve this: GPS-disciplined
                  oscillators (which defeats the purpose of a GPS alternative), fiber or PTP backhaul
                  (the approach taken by NextNav, at enormous centralized cost), or RF
                  self-synchronization (which requires high bandwidth and good geometry — both
                  unavailable at LF frequencies).
                </p>
                <p>
                  At a generous 5 km per-node radius, covering the continental United States alone
                  would require 4–8 million synchronized nodes, each sporting a 15-meter vertical
                  antenna with a ground radial system and loading coils. In urban environments where
                  node radii collapse to 1–2 km, the density requirement escalates further. This is
                  not a consumer-installable product.
                </p>

                {/* Callout — insight */}
                <div className="bg-surface border-l-4 border-teal-500 p-6 rounded-r-lg my-8">
                  <p className="text-teal-500 font-semibold text-sm mb-2">Key Insight</p>
                  <p className="text-slate-400">
                    The LF physics that makes time signals like WWVB and DCF77 work — long range,
                    building penetration — is inseparable from the continent-scale transmitter power
                    those systems use. You cannot get the same propagation from milliwatts on
                    residential rooftops.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Signals of Opportunity */}
          <section id="soop" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">03</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">
              Signals of Opportunity: The Third Path
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                If building new low-frequency transmitters fails on regulatory, physical, and
                economic grounds, and satellite constellations remain inherently fragile, a third
                path exists: exploit the transmitters that are already there.
              </p>
              <p>
                The modern radio environment is dense with high-power, precisely timed signals that
                were designed for communication but carry exploitable timing information. LTE and 5G
                base stations continuously broadcast synchronization signals — Primary and Secondary
                Synchronization Signals, Cell-specific Reference Signals, and in 5G NR, dedicated
                Positioning Reference Signals. Digital television stations emit high-power pilot
                carriers with stable, predictable timing. FM radio stations carry RDS subcarriers
                with embedded timing data. LEO satellite constellations are adding thousands of new
                downlink signals each year.
              </p>
              <p>
                This approach — known in the research community as Signals-of-Opportunity (SoOP)
                positioning — has been the subject of active academic research for over a decade.
                Published work has demonstrated 10–100 meter accuracy using LTE signals alone, with
                sub-10-meter results when multiple signal types are fused. The critical insight is
                that a SoOP receiver is purely passive: it only receives, never transmits. This
                means:
              </p>
              <p>
                No spectrum license is required — receiving is legal in every jurisdiction on Earth.
                No interference is possible — a passive receiver cannot affect any other system. No
                new infrastructure is needed — the transmitters already exist and are maintained by
                telecom operators, broadcasters, and satellite operators for their own commercial
                purposes.
              </p>
              <p>
                The bandwidth problem that cripples LF approaches vanishes at UHF and microwave
                frequencies. An LTE signal occupies 10–20 MHz of bandwidth — three orders of
                magnitude more than the 10 kHz available at LF. 5G NR signals can span up to 400
                MHz. The Cramér–Rao bound on timing precision scales inversely with bandwidth, which
                is why SoOP positioning achieves meter-class accuracy where LF systems are limited
                to kilometer-class.
              </p>
              <p>
                The antenna problem likewise disappears. At 2 GHz, a quarter-wave antenna is 3.75
                centimeters. An RTL-SDR dongle with a small whip antenna receives efficiently across
                the entire band of interest. There is no 1/114-wavelength efficiency catastrophe.
              </p>

              {/* Callout — insight */}
              <div className="bg-surface border-l-4 border-teal-500 p-6 rounded-r-lg my-8">
                <p className="text-teal-500 font-semibold text-sm mb-2">The Azimuth Insight</p>
                <p className="text-slate-400">
                  The positioning signals are already everywhere. Cell towers, TV stations, and FM
                  transmitters blanket the inhabited world with precisely timed broadcasts at power
                  levels that dwarf GPS by 60–100 dB. The missing piece is not the signal — it is
                  the network of receivers to exploit it.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Architecture */}
          <section id="architecture" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">04</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">
              Azimuth Network Architecture
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Azimuth is a crowdsourced network of passive SDR receiver nodes that continuously
              observe the radio environment, extract timing and signal-characterization data from
              ambient broadcasts, and report structured observations to a decentralized aggregation
              layer. The aggregation layer fuses observations from multiple nodes to produce
              positioning fixes and radio environment maps that can be queried by applications.
            </p>

            {/* 4.1 Signal Targets */}
            <div id="signal-targets" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">4.1 Signal Targets</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Azimuth nodes are designed to acquire timing data from multiple signal classes
                simultaneously. Each class offers different strengths in coverage, bandwidth, power,
                and geometric diversity.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Signal Class</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Frequency Range</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Bandwidth</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Timing Signals</th>
                      <th className="text-left py-3 px-4 text-slate-100 font-semibold">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-slate-100">LTE / 4G</td>
                      <td className="py-3 px-4">700 MHz – 2.6 GHz</td>
                      <td className="py-3 px-4">10–20 MHz</td>
                      <td className="py-3 px-4">PSS, SSS, CRS, PRS</td>
                      <td className="py-3 px-4">Urban + suburban, dense</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-slate-100">5G NR</td>
                      <td className="py-3 px-4">600 MHz – 39 GHz</td>
                      <td className="py-3 px-4">20–400 MHz</td>
                      <td className="py-3 px-4">SSB, CSI-RS, PRS</td>
                      <td className="py-3 px-4">Urban, very high precision</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-slate-100">Digital TV</td>
                      <td className="py-3 px-4">470–890 MHz</td>
                      <td className="py-3 px-4">6–8 MHz</td>
                      <td className="py-3 px-4">Pilot carriers, TPS</td>
                      <td className="py-3 px-4">Wide-area, high power</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-slate-100">FM Radio</td>
                      <td className="py-3 px-4">88–108 MHz</td>
                      <td className="py-3 px-4">200 kHz</td>
                      <td className="py-3 px-4">RDS subcarrier</td>
                      <td className="py-3 px-4">Ubiquitous, building penetration</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-slate-100">LEO Satellites</td>
                      <td className="py-3 px-4">10–30 GHz</td>
                      <td className="py-3 px-4">50–250 MHz</td>
                      <td className="py-3 px-4">Downlink sync</td>
                      <td className="py-3 px-4">Global, sky-ground diversity</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-slate-400 leading-relaxed">
                Multi-signal fusion is central to the architecture. Any individual signal type has
                gaps — LTE coverage thins in rural areas, DTV is absent in some geographies, 5G NR
                is urban-only in early deployment. By correlating timing data across multiple signal
                classes, Azimuth achieves both wider coverage and higher positioning precision than
                any single source provides.
              </p>
            </div>

            {/* 4.2 Node Tiers */}
            <div id="node-tiers" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-6">4.2 Node Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Tier 0 */}
                <div className="bg-surface border border-border border-t-2 border-t-teal-500 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Tier 0 — Mobile Observer
                  </h4>
                  <p className="text-amber-500 text-sm font-semibold mb-3">Free</p>
                  <p className="text-slate-400 text-sm mb-4">
                    The onramp. Users run the Azimuth Android app on their existing phone — no
                    hardware purchase required. The app passively collects cell tower survey data
                    (CellInfo: cell ID, RSRP/RSRQ/SINR, timing advance, PCI, carrier frequency),
                    GNSS raw measurements (pseudoranges, carrier phase, Doppler, CN0 via Android
                    GnssMeasurement API), WiFi signal surveys, and WiFi RTT where supported. All
                    observations are GPS-tagged. This data builds the radio environment map that
                    Tier 1+ SDR nodes&apos; timing observations are resolved against.
                  </p>
                  <div className="pt-3 border-t border-border text-xs text-slate-500 font-mono">
                    Android 8.0+ · Cell/GNSS/WiFi · GPS-tagged · $0 · <a href="/download" className="text-amber-500 hover:text-amber-400">Download APK</a>
                  </div>
                </div>

                {/* Tier 1 */}
                <div className="bg-surface border border-border border-t-2 border-t-amber-500 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Tier 1 — BYOD
                  </h4>
                  <p className="text-amber-500 text-sm font-semibold mb-3">~$30</p>
                  <p className="text-slate-400 text-sm mb-4">
                    The SDR entry point. Participants plug a $30 RTL-SDR V4 dongle into any Windows
                    or Linux machine, install the Azimuth daemon, and begin observing. The RTL-SDR V4
                    covers 500 kHz to 1.766 GHz with 2.4 MHz instantaneous bandwidth — sufficient to
                    acquire LTE synchronization signals, FM RDS, and DTV pilots. Timing is derived
                    from the host system clock with NTP discipline.
                  </p>
                  <div className="pt-3 border-t border-border text-xs text-slate-500 font-mono">
                    500 kHz – 1.766 GHz · 8-bit ADC · 2.4 MHz BW · NTP
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="bg-surface border border-border border-t-2 border-t-amber-500 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Tier 2 — Dedicated Node
                  </h4>
                  <p className="text-amber-500 text-sm font-semibold mb-3">~$150–250</p>
                  <p className="text-slate-400 text-sm mb-4">
                    A purpose-built unit with a GPS-disciplined oscillator providing nanosecond-class
                    timing, outdoor antenna placement for optimal signal reception, and 24/7
                    unattended operation. Higher-quality ADC and wider instantaneous bandwidth enable
                    simultaneous multi-band observation.
                  </p>
                  <div className="pt-3 border-t border-border text-xs text-slate-500 font-mono">
                    GPSDO timing · Outdoor antenna · 24/7 operation
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="bg-surface border border-border border-t-2 border-t-amber-500 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Tier 3 — Coherent Array
                  </h4>
                  <p className="text-amber-500 text-sm font-semibold mb-3">~$400–600</p>
                  <p className="text-slate-400 text-sm mb-4">
                    The premium tier. A multi-channel coherent receiver (such as KrakenSDR) with a
                    5-element antenna array enables both TDOA and Angle-of-Arrival measurements.
                    Phase-coherent channels allow interferometric techniques that resolve signal
                    direction as well as timing.
                  </p>
                  <div className="pt-3 border-t border-border text-xs text-slate-500 font-mono">
                    5-channel coherent · TDOA + AoA · Premium rewards
                  </div>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                This tiered approach is deliberate. Tier 0 eliminates the cost barrier entirely,
                turning every Android phone into a passive observer that enriches the radio
                environment map. Tier 1 enables mass SDR adoption by leveraging hardware many
                enthusiasts already own, seeding the network with geographic density. Tiers 2 and 3
                add precision and capability at the margins, improving the quality of the observation
                dataset without requiring everyone to invest in specialized equipment. Many Tier 0
                contributors convert to Tier 1 when they see the reward differential.
              </p>
            </div>

            {/* 4.3 Positioning Engine */}
            <div id="positioning-engine" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">4.3 Positioning Engine</h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Azimuth computes position through two complementary methods, fused in the
                  aggregation layer:
                </p>
                <p>
                  <span className="text-slate-100 font-semibold">Time-Difference-of-Arrival (TDOA).</span>{' '}
                  When three or more nodes observe the same signal source, the differences in
                  observed arrival times constrain the receiver&apos;s position to a set of
                  hyperboloids. The intersection of these hyperboloids yields a position fix. TDOA
                  does not require knowledge of the transmitter&apos;s absolute timing — only the
                  relative differences between receivers matter — which eliminates the transmitter
                  synchronization problem that plagues purpose-built networks.
                </p>
                <p>
                  <span className="text-slate-100 font-semibold">Signal Fingerprinting.</span>{' '}
                  Every location has a unique radio signature: the set of observable signal sources,
                  their received power levels, multipath characteristics, and timing relationships.
                  Azimuth builds a continuously-updated radio environment map from crowdsourced
                  observations. A positioning query compares a new observation against this map to
                  estimate location, even when too few signals are available for geometric TDOA.
                </p>
                <p>
                  The fusion of TDOA and fingerprinting provides robustness that neither method
                  achieves alone. TDOA excels in open environments with clear line-of-sight to
                  multiple transmitters. Fingerprinting excels indoors and in dense urban canyons
                  where multipath is severe but the radio signature is highly location-specific. The
                  aggregation layer weights each method dynamically based on observation quality and
                  signal geometry.
                </p>
              </div>
            </div>
          </section>

          {/* 5. The DePIN Model */}
          <section id="depin-model" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">05</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">The DePIN Model</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                A centralized SoOP positioning network could work — but it would face the same
                scaling challenges as any infrastructure company. Receiver hardware must be
                purchased, deployed, maintained, and connected at thousands of locations. Site
                leases, power, internet connectivity, and maintenance staff drive costs per node
                well above the hardware price.
              </p>
              <p>
                Azimuth inverts this model through Decentralized Physical Infrastructure.
                Participants deploy and maintain their own receiver nodes, contributing observations
                to the network in exchange for token rewards. The network scales with the incentive:
                as more participants deploy nodes, coverage expands, the radio environment map
                becomes denser and more accurate, positioning precision improves, and the dataset
                becomes more valuable to consumers — which in turn funds higher rewards, attracting
                more participants.
              </p>
              <p>
                This flywheel is particularly well-suited to SoOP positioning because the marginal
                value of each new node is high and geographically differentiated. A node in an
                underserved area fills a coverage gap that cannot be filled by any existing node.
                Unlike bandwidth-sharing or storage DePINs where nodes are largely fungible,
                positioning nodes are valuable precisely because of where they are.
              </p>
              <p>
                The receive-only constraint is a critical advantage for the DePIN model. Because
                nodes never transmit, there are zero regulatory barriers to deployment in any
                jurisdiction. A participant in Tokyo, Lagos, São Paulo, or Oslo faces the same
                regulatory burden: none. This is not true for any transmitting DePIN, where spectrum
                licensing varies radically across jurisdictions and often requires commercial
                agreements or government approvals.
              </p>
            </div>
          </section>

          {/* 6. Tokenomics */}
          <section id="tokenomics" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">06</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Tokenomics</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              The Azimuth token is the unit of value exchange within the network. It flows between
              three participant classes: node operators who contribute observations, data consumers
              who query the positioning and mapping services, and governance participants who stake
              tokens to vote on protocol parameters.
            </p>

            {/* 6.1 */}
            <div id="proof-of-observation" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">6.1 Proof of Observation</h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Azimuth rewards nodes based on Proof of Observation — cryptographically verifiable
                  evidence that a node received, processed, and reported a specific signal at a
                  specific time. Unlike proof-of-work systems that consume energy for its own sake,
                  Proof of Observation rewards useful work: the generation of positioning-grade radio
                  observations that improve the network&apos;s coverage and accuracy.
                </p>
                <p>
                  An observation report includes the signal source identifier (cell ID, transmitter
                  callsign, or satellite PRN), the measured timing parameters (time-of-arrival,
                  carrier phase, Doppler), received signal quality metrics, and a timestamp anchored
                  to the node&apos;s timing reference. Reports are signed with the node&apos;s
                  cryptographic identity and submitted to the aggregation layer, which
                  cross-validates observations against reports from neighboring nodes to detect
                  fabrication.
                </p>
              </div>
            </div>

            {/* 6.2 */}
            <div id="reward-factors" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-6">6.2 Reward Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Coverage Value</h4>
                  <p className="text-slate-400 text-sm">
                    Observations from underserved areas earn higher rewards than redundant
                    observations from well-covered locations. The reward function uses a geographic
                    density coefficient that decreases as node concentration increases in a given
                    cell.
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Signal Diversity</h4>
                  <p className="text-slate-400 text-sm">
                    Nodes that observe multiple signal classes — LTE and DTV and FM simultaneously —
                    produce richer data for multi-signal fusion and earn a diversity multiplier
                    relative to single-signal observers.
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Timing Quality</h4>
                  <p className="text-slate-400 text-sm">
                    Higher-quality timing references (GPSDO vs. NTP) produce more precise
                    observations. The reward function applies a precision tier multiplier
                    corresponding to the node&apos;s demonstrated timing accuracy.
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-2">Uptime &amp; Consistency</h4>
                  <p className="text-slate-400 text-sm">
                    Continuous, reliable operation earns an uptime bonus. Intermittent nodes that
                    appear and disappear are less valuable for real-time positioning and earn
                    proportionally less.
                  </p>
                </div>
              </div>
            </div>


            {/* 6.3 Reward Mechanics */}
            <div id="reward-mechanics" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">6.3 Reward Mechanics</h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  The reward function combines several multiplicative factors that incentivize
                  geographic coverage, discourage over-concentration, and reward hardware investment.
                  All parameters are drawn from the Rewards Architecture v1 specification.
                </p>
              </div>

              <div className="mt-6 space-y-8">
                {/* Base Points */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">Base Points per Epoch</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Each tier earns a fixed number of base points per observation epoch, reflecting the
                    hardware investment and data quality contributed:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-navy rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 0</p>
                      <p className="text-2xl font-bold text-teal-500">1</p>
                    </div>
                    <div className="bg-navy rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 1</p>
                      <p className="text-2xl font-bold text-amber-500">3</p>
                    </div>
                    <div className="bg-navy rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 2</p>
                      <p className="text-2xl font-bold text-amber-500">8</p>
                    </div>
                    <div className="bg-navy rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 3</p>
                      <p className="text-2xl font-bold text-amber-500">15</p>
                    </div>
                  </div>
                </div>

                {/* Hex Freshness */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">Hex Freshness Multiplier</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    H3 resolution-8 hexagons are classified by how recently they were first observed. Early
                    arrivals to uncharted hexes earn dramatically more, incentivizing geographic expansion
                    over clustering:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 text-slate-200 font-medium">Status</th>
                          <th className="text-left py-2 text-slate-200 font-medium">Multiplier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-slate-400">
                        <tr><td className="py-2 pr-4">Virgin (never observed)</td><td className="py-2 font-mono text-teal-500">3.0&times;</td></tr>
                        <tr><td className="py-2 pr-4">Stale (long since observed)</td><td className="py-2 font-mono text-teal-500">2.0&times;</td></tr>
                        <tr><td className="py-2 pr-4">Aging</td><td className="py-2 font-mono text-amber-500">1.5&times;</td></tr>
                        <tr><td className="py-2 pr-4">Baseline</td><td className="py-2 font-mono text-slate-300">1.0&times;</td></tr>
                        <tr><td className="py-2 pr-4">Recent</td><td className="py-2 font-mono text-slate-500">0.25&times;</td></tr>
                        <tr><td className="py-2 pr-4">Saturated</td><td className="py-2 font-mono text-red-500">0.10&times;</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Saturation Decay */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">Saturation Decay</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    As more nodes occupy the same hex, per-node rewards decay logarithmically:
                  </p>
                  <p className="font-mono text-amber-500 text-center text-lg mb-4">
                    reward = base &times; 1 / (1 + k &middot; ln(N))
                  </p>
                  <p className="text-slate-400 text-sm mb-3">
                    where N is the number of active nodes in the hex and k is tier-dependent:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-navy rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 0 (k)</p>
                      <p className="text-lg font-mono text-slate-300">0.50</p>
                    </div>
                    <div className="bg-navy rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 1 (k)</p>
                      <p className="text-lg font-mono text-slate-300">0.30</p>
                    </div>
                    <div className="bg-navy rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 2 (k)</p>
                      <p className="text-lg font-mono text-slate-300">0.15</p>
                    </div>
                    <div className="bg-navy rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tier 3 (k)</p>
                      <p className="text-lg font-mono text-slate-300">0.10</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-3">
                    Higher-tier nodes decay more slowly, reflecting greater hardware investment and data
                    quality.
                  </p>
                </div>

                {/* Collision Detection */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">Collision Detection</h4>
                  <p className="text-slate-400 text-sm">
                    When multiple nodes activate in the same H3 res-8 hex within a 30-minute window,
                    latecomers are suppressed for the remainder of that window. This prevents reward
                    sniping and discourages rapid relocation to high-value hexes. The first node to
                    submit valid observations in a hex claims the epoch; subsequent arrivals within 30
                    minutes receive zero reward for that epoch.
                  </p>
                </div>

                {/* Density Cap */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">Density Cap</h4>
                  <p className="text-slate-400 text-sm">
                    Beyond the saturation decay curve, a hard density cap limits per-node rewards as
                    1/&radic;N, with an absolute maximum of 10 nodes per hex. Beyond 10 nodes, additional
                    nodes in the same hex earn zero reward regardless of tier or data quality. This
                    ensures the network grows outward rather than clustering.
                  </p>
                </div>

                {/* RTK Bonus */}
                <div className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-100 mb-3">RTK Bonus</h4>
                  <p className="text-slate-400 text-sm">
                    Nodes with Real-Time Kinematic (RTK) GNSS positioning &mdash; providing centimeter-level
                    accuracy in their own location &mdash; earn a 1.5&times; multiplier on all observations.
                    Precise node positioning dramatically improves the accuracy of TDOA calculations,
                    making RTK-equipped nodes disproportionately valuable to the network.
                  </p>
                </div>
              </div>
            </div>

            {/* 6.4 */}
            <div id="data-marketplace" className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-100 mb-4">6.4 Data Marketplace</h3>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  The demand side of the token economy is the positioning and mapping query service.
                  Applications that need GPS-independent positioning, indoor location, radio
                  environment intelligence, or interference detection query the Azimuth network and
                  pay in tokens. Use cases include:
                </p>
                <p>
                  <span className="text-slate-100 font-semibold">Positioning queries</span> —
                  applications submit a set of signal observations and receive a computed position
                  fix with confidence intervals.{' '}
                  <span className="text-slate-100 font-semibold">Radio environment maps</span> —
                  coverage planners, interference analysts, and spectrum regulators access
                  continuously-updated maps of the radio environment built from crowdsourced
                  observations.{' '}
                  <span className="text-slate-100 font-semibold">Integrity monitoring</span> —
                  critical infrastructure operators compare GNSS-derived positions against Azimuth
                  SoOP positions to detect spoofing or jamming.{' '}
                  <span className="text-slate-100 font-semibold">Historical data</span> —
                  researchers and analysts access archived observation data for propagation studies,
                  interference forensics, and network planning.
                </p>
                <p>
                  Revenue from the data marketplace flows back to node operators through the reward
                  pool, creating a sustainable economic loop: operators generate data, consumers pay
                  for data, and the proceeds fund continued operation and network expansion.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Roadmap */}
          <section id="roadmap" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">07</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-8">Roadmap</h2>

            <div className="relative pl-8 border-l-2 border-amber-500/30 space-y-12">
              {/* Phase 1 — Active */}
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-navy" />
                <div className="bg-surface border border-amber-500/50 rounded-xl p-6">
                  <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded mb-3">
                    Phase 1 — Active
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Daemon, Tier 1 Nodes, and Core Network
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Release the Azimuth daemon for Windows and Linux with RTL-SDR V4 support. Initial
                    signal acquisition targets: LTE PSS/SSS and FM RDS. Launch the observation
                    aggregation backend and node registration system. Deploy the token reward
                    mechanism and begin Proof of Observation distribution to early node operators.
                  </p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-surface border-2 border-amber-500/50" />
                <div className="bg-surface border border-border rounded-xl p-6">
                  <span className="inline-block px-2 py-1 bg-surface-alt text-slate-400 text-xs font-semibold rounded mb-3">
                    Phase 2
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Multi-Signal Fusion and Positioning API
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Add DTV pilot acquisition, LTE CRS/PRS processing, and 5G NR synchronization
                    signal support. Launch the radio environment mapping service and the positioning
                    query API. Begin building the signal fingerprint database from crowdsourced
                    observations. Open the data marketplace for early consumers.
                  </p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-surface border-2 border-amber-500/50" />
                <div className="bg-surface border border-border rounded-xl p-6">
                  <span className="inline-block px-2 py-1 bg-surface-alt text-slate-400 text-xs font-semibold rounded mb-3">
                    Phase 3
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    Tier 2 Hardware, GPSDO Timing, and AoA
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Release the Tier 2 dedicated node specification with GPS-disciplined timing.
                    Introduce carrier-phase TDOA for sub-meter precision in favorable geometries.
                    Begin Tier 3 coherent array development for angle-of-arrival capability. Expand
                    the positioning engine to fuse TDOA, AoA, and fingerprinting in real time.
                  </p>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="relative">
                <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-surface border-2 border-amber-500/50" />
                <div className="bg-surface border border-border rounded-xl p-6">
                  <span className="inline-block px-2 py-1 bg-surface-alt text-slate-400 text-xs font-semibold rounded mb-3">
                    Phase 4
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mb-2">
                    LEO Satellites, Governance, and Enterprise
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Add LEO satellite downlink acquisition for sky-ground positioning diversity.
                    Launch full on-chain governance for protocol parameters and reward function
                    tuning. Build enterprise integration pathways for critical infrastructure
                    operators, autonomous vehicle platforms, and defense applications. Target 10,000+
                    active nodes across 50+ countries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Conclusion */}
          <section id="conclusion" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">08</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Conclusion</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                The world depends on satellite positioning systems that operate on signals weaker
                than the cosmic microwave background. Every proposed terrestrial alternative based on
                purpose-built low-frequency transmitters fails the same test: the physics of antenna
                efficiency and bandwidth at LF, combined with the regulatory impossibility of
                harmonizing license-free radiating transmission across jurisdictions, makes
                decentralized LF positioning a dead end.
              </p>
              <p>
                Azimuth recognizes that the positioning signals are already everywhere. Cell towers,
                television stations, FM transmitters, and LEO satellites saturate the radio
                environment with high-power, precisely timed broadcasts that cover the inhabited
                world. The missing piece is not the signal infrastructure — it is the receiver
                infrastructure to exploit it.
              </p>
              <p>
                By building a decentralized network of passive SDR receivers, Azimuth turns the
                existing radio environment into a positioning layer. No new transmitters. No spectrum
                licenses. No regulatory barriers. No single point of failure. Every node makes the
                network more accurate, every observation makes the radio environment map more
                complete, and every participant earns from the value they create.
              </p>
              <p className="text-slate-100 font-semibold text-lg">
                The signals are already there. Azimuth listens.
              </p>
            </div>
          </section>

          {/* References */}
          <section id="references" className="mb-16 scroll-mt-24">
            <p className="font-mono text-amber-500 text-sm mb-2">—</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">References</h2>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <div>
                <h4 className="text-slate-100 font-semibold mb-2">Regulatory Sources</h4>
                <p>
                  FCC 47 CFR Part 15 (§ 15.209, § 15.217, § 15.219, § 15.225); Innovation, Science
                  and Economic Development Canada RSS-210 Annex B; Ofcom IR 2030 Table 2; ERC
                  Recommendation 70-03 Annex 9; ETSI EN 300 330; European Commission Decision
                  2006/771/EC.
                </p>
              </div>
              <div>
                <h4 className="text-slate-100 font-semibold mb-2">
                  Propagation and Positioning
                </h4>
                <p>
                  ITU-R P.368 (Ground-wave propagation curves); ITU-R P.372 (Radio noise);
                  Cramér–Rao bound on time-of-arrival estimation; LORAN-C / eLoran positioning
                  accuracy literature (Offermans et al., Johnson et al.); RTI International,
                  &ldquo;Economic Benefits of the Global Positioning System,&rdquo; prepared for
                  NIST, June 2019.
                </p>
              </div>
              <div>
                <h4 className="text-slate-100 font-semibold mb-2">Signals of Opportunity</h4>
                <p>
                  Kassas, Z.Z.M., &ldquo;Navigation from Low-Earth Orbit,&rdquo; series of
                  publications 2019–2025; Shamaei, K. et al., &ldquo;LTE receiver design and
                  multipath analysis for navigation in urban environments,&rdquo; Navigation, 2018;
                  Khalife, J. et al., &ldquo;Navigation with differential carrier phase measurements
                  from megaconstellation LEO satellites,&rdquo; IEEE, 2020; Del Peral-Rosado, J.A.
                  et al., &ldquo;Survey of cellular mobile radio localization methods,&rdquo; IEEE
                  Communications Surveys &amp; Tutorials, 2018.
                </p>
              </div>
              <div>
                <h4 className="text-slate-100 font-semibold mb-2">
                  DePIN and Related Networks
                </h4>
                <p>
                  GEODNET (GNSS reference station DePIN); Locata Corporation (terrestrial
                  carrier-phase positioning); NextNav (licensed metropolitan pseudolite network);
                  Helium (IoT DePIN precedent).
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-8 mt-16">
            <p className="text-slate-500 text-sm">
              © 2026 Azimuth. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
