export interface ContentEntry {
  title: string;
  description: string;
  content: string;
}

export const contentIndex: Record<string, ContentEntry> = {
  "/": {
    title: "Home",
    description: "Landing page introducing Azimuth as a decentralized alternative to GPS.",
    content: "Landing page introducing Azimuth as a decentralized alternative to GPS. Explains the core concept: passive SDR receivers capture timing from ambient radio signals (LTE, DTV, FM) to compute position fixes without transmitting. Covers the four-step process (listen, timestamp, submit, solve), three signal target categories, four node tiers, and live network statistics.",
  },
  "/litepaper": {
    title: "Litepaper",
    description: "Five-minute overview of why GPS is a single point of failure, how signals of opportunity work as an alternative.",
    content: "Five-minute overview of why GPS is a single point of failure, how signals of opportunity work as an alternative, and how Azimuth's decentralized network of passive receivers builds a positioning layer from existing radio infrastructure. Covers the problem (GPS fragility, jamming, spoofing), the solution (SoOP-based positioning), network architecture, and token economics at a high level.",
  },
  "/whitepaper": {
    title: "Whitepaper",
    description: "Full technical specification covering signal processing pipeline, TDOA multilateration algorithms, and economic design.",
    content: "Full technical specification covering signal processing pipeline, TDOA multilateration algorithms, node hardware requirements, consensus mechanism for observation validation, network topology, security model, and economic design. The most comprehensive technical document on the site (~3600 words).",
  },
  "/docs/architecture": {
    title: "Architecture",
    description: "Four-layer system design: Node Layer, Transport Layer, Processing Layer, and Query Layer.",
    content: "Four-layer system design: Node Layer (SDR receivers capturing timestamps), Transport Layer (observation submission), Processing Layer (TDOA computation, radio environment mapping, signal fingerprinting, cross-validation), and Query Layer (positioning API). Describes how data flows from raw RF capture through validated position fixes.",
  },
  "/docs/signals": {
    title: "Signals",
    description: "Technical breakdown of signal categories: LTE/5G, Digital Television, FM Radio, and planned LEO satellite support.",
    content: "Technical breakdown of signal categories: LTE/5G (cell tower reference signals, 10-50ns precision), Digital Television (ATSC/DVB-T pilots, high-power 50kW-1MW, 50-150km range), FM Radio (RDS subcarriers, ubiquitous coverage), and planned LEO satellite support (Starlink/Iridium downlinks). Compares bandwidth, update rate, and geographic coverage for each.",
  },
  "/docs/tokenomics": {
    title: "Tokenomics",
    description: "Token utility: node operator rewards, query payments, and governance.",
    content: "Token utility: node operator rewards (proportional to data quality), query payments (positioning API access), and governance. Reward factors include coverage area, uptime, data quality, and signal diversity. Tier multipliers: Tier 0 mobile, Tier 1 baseline, Tier 2 enhanced, Tier 3 premium. Anti-Sybil via GPS-disciplined cross-validation and signal fingerprinting.",
  },
  "/docs/faq": {
    title: "FAQ",
    description: "Answers to common questions about licenses, hardware requirements, and accuracy.",
    content: "Answers to common questions: no license needed (receive-only), minimum hardware is RTL-SDR V4 (~$30) plus any computer, complements GPS rather than replacing it, targets 10-100m accuracy with sufficient coverage, chain selection in progress, team operates pseudonymously.",
  },
  "/guides/tier0-setup": {
    title: "Tier 0 Setup",
    description: "Turn your Android phone into an Azimuth node with zero hardware cost.",
    content: "Turn your Android phone into an Azimuth node. Collects cell tower surveys, GNSS raw measurements, WiFi signal surveys, and WiFi RTT. Zero hardware cost. Rewards based on coverage area, mobility diversity, data completeness, and uptime.",
  },
  "/guides/quickstart": {
    title: "Quickstart",
    description: "Step-by-step Tier 1 BYOD setup: RTL-SDR V4 dongle, stock dipole antenna, Windows/Linux install.",
    content: "Step-by-step Tier 1 BYOD setup: RTL-SDR V4 dongle, stock dipole antenna, Windows/Linux install, account creation at localhost:8080, signal verification within 60 seconds. Optimization tips for antenna placement.",
  },
  "/guides/tier2-setup": {
    title: "Tier 2 Setup",
    description: "Placeholder for Tier 2 dedicated node setup with pre-configured hardware and software.",
    content: "Placeholder for Tier 2 dedicated node setup. Hardware package will include: single-board computer, RTL-SDR V4, GPS-disciplined oscillator, outdoor antenna with weatherproof enclosure, pre-configured software image.",
  },
  "/guides/tier3-setup": {
    title: "Tier 3 Setup",
    description: "Placeholder for Tier 3 coherent array setup with multi-channel SDR and antenna arrays.",
    content: "Placeholder for Tier 3 coherent array setup. Hardware package will include: multi-channel coherent SDR receiver, calibrated antenna array, GPS-disciplined oscillator, weatherproof outdoor enclosure, pre-configured software image.",
  },
  "/blog/welcome": {
    title: "Introducing Azimuth",
    description: "Introductory blog post announcing Azimuth and framing the problem of GPS dependency.",
    content: "Introductory blog post announcing Azimuth. Frames the problem of GPS dependency and vulnerability to jamming/spoofing. Introduces signals-of-opportunity approach as a decentralized alternative.",
  },
  "/blog/soop-explained": {
    title: "What Are Signals of Opportunity?",
    description: "Technical explainer on signals of opportunity (SoOP) and trilateration without GPS.",
    content: "Technical explainer on signals of opportunity (SoOP). Every cell tower, TV transmitter, and FM station broadcasts timing signals continuously. Azimuth nodes passively receive these signals and extract precise timestamps. Multiple timestamps from different transmitters enable trilateration without GPS.",
  },
  "/blog/signals-of-opportunity-positioning": {
    title: "Signals of Opportunity Positioning: The Complete Technical Guide",
    description: "How SoOP positioning uses ambient RF from cell towers, TV, and FM to enable GPS-independent navigation.",
    content: "Comprehensive technical guide to SoOP positioning. Covers the physics of timing extraction from LTE, digital TV, and FM signals, TDOA algorithms for combining observations into position fixes, the research landscape including key programs and researchers, accuracy expectations (10-100m outdoor), advantages over GNSS (indoor penetration, anti-jam, no spectrum allocation), and Azimuth's crowdsourced SDR mesh approach.",
  },
  "/blog/gps-spoofing-detection": {
    title: "GPS Spoofing Detection: Threats, Techniques, and Decentralized Solutions",
    description: "Understanding GPS spoofing threats and how signals of opportunity provide tamper-evident positioning.",
    content: "In-depth analysis of GPS spoofing threats and detection techniques. Distinguishes jamming (denial) from spoofing (deception), covers attack taxonomy (meaconing, replay, sophisticated spoofing), documents real-world incidents, and explains detection methods including C/N0 monitoring, multi-constellation cross-checks, and SoOP-based cross-validation. Discusses EO 13905 regulatory framework and decentralized detection advantages.",
  },
  "/blog/tdoa-positioning": {
    title: "TDOA Positioning: How Time-Difference-of-Arrival Navigation Works",
    description: "Technical guide to TDOA multilateration — the algorithm behind cellular E911 and SoOP systems.",
    content: "Technical guide to Time-Difference-of-Arrival positioning. Explains the mathematical framework of hyperbolic multilateration, compares TDOA with TOA, AOA, and fingerprinting approaches, traces the history from LORAN-C through modern cellular E911 and 5G positioning, and covers practical implementation challenges including clock synchronization, geometric dilution of precision, and multipath mitigation.",
  },
  "/blog/state-of-depin-pnt-2026": {
    title: "The State of Decentralized PNT in 2026",
    description: "Comprehensive survey of decentralized positioning, navigation, and timing projects and market opportunities.",
    content: "Comprehensive survey of the decentralized PNT landscape in 2026. Covers GNSS vulnerability trends, regulatory frameworks (EO 13905, EU Space Regulation), technology approaches (SoOP, eLoran, LEO PNT, inertial), DePIN PNT projects with fair comparisons, market opportunities in autonomous vehicles, drones, IoT, and critical infrastructure, and 2027 predictions for technology convergence and market adoption.",
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Web application for node operators to monitor status, view rewards, and manage settings.",
    content: "Web application for node operators. Sign in with email to monitor node status, view earned rewards, and manage settings.",
  },
};

export function searchContent(query: string, limit: number = 5): Array<{ path: string; title: string; url: string; excerpt: string }> {
  const lowerQuery = query.toLowerCase();
  const results: Array<{ path: string; title: string; url: string; excerpt: string; score: number }> = [];

  for (const [path, entry] of Object.entries(contentIndex)) {
    let score = 0;

    // Title match (highest weight)
    if (entry.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }

    // Description match (medium weight)
    if (entry.description.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    // Content match (lower weight)
    if (entry.content.toLowerCase().includes(lowerQuery)) {
      score += 1;
    }

    if (score > 0) {
      results.push({
        path,
        title: entry.title,
        url: `https://azimuth.day${path}`,
        excerpt: entry.description,
        score,
      });
    }
  }

  // Sort by score descending, then by title ascending
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // Return top N results without score field
  return results.slice(0, limit).map(({ score, ...rest }) => rest);
}
