import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Download Azimuth Observer",
  description:
    "Download the Azimuth Observer app to participate in the decentralized positioning network.",
};

function getVersionInfo() {
  try {
    const versionPath = path.join(process.cwd(), "public", "version.json");
    return JSON.parse(fs.readFileSync(versionPath, "utf-8"));
  } catch {
    return { version_name: "0.1.0", release_notes: null };
  }
}

function getApkSize() {
  try {
    const apkPath = path.join(process.cwd(), "public", "downloads", "azimuth-observer.apk");
    const stats = fs.statSync(apkPath);
    return `~${Math.round(stats.size / 1024 / 1024)} MB`;
  } catch {
    return "~34 MB";
  }
}

export default function DownloadPage() {
  const version = getVersionInfo();
  const apkSize = getApkSize();
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Download{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Azimuth Observer
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto">
          Join the decentralized positioning network from your Android device.
          Collect wireless signal observations and earn points.
        </p>

        {/* Android Download */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-center gap-3">
            <svg
              className="w-8 h-8 text-emerald-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.523 15.341a.5.5 0 0 0 0-.682l-.002-.002a.5.5 0 0 0-.682 0L14 17.496V4.5a.5.5 0 0 0-1 0v12.996l-2.839-2.839a.5.5 0 0 0-.707.707l3.692 3.692a.5.5 0 0 0 .708 0l3.669-3.715z" />
              <path d="M4.5 22h15a.5.5 0 0 0 0-1h-15a.5.5 0 0 0 0 1z" />
            </svg>
            <h2 className="text-2xl font-semibold">Android</h2>
          </div>

          <a
            href="/downloads/azimuth-observer.apk"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy font-semibold px-8 py-3 rounded-xl transition-colors text-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download APK
          </a>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
            <div>
              <span className="text-slate-500">Version</span>
              <p className="text-slate-300">v{version.version_name}</p>
            </div>
            <div>
              <span className="text-slate-500">Size</span>
              <p className="text-slate-300">{apkSize}</p>
            </div>
            <div>
              <span className="text-slate-500">Requires</span>
              <p className="text-slate-300">Android 8.0+</p>
            </div>
            <div>
              <span className="text-slate-500">Updated</span>
              <p className="text-slate-300">June 2026</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            You may need to enable &ldquo;Install from unknown sources&rdquo; in
            your device settings to install this APK.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-400">Coming Soon</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface/50 border border-border/50 rounded-xl p-6 opacity-60">
              <h4 className="font-medium text-slate-300">Desktop Daemon</h4>
              <p className="text-sm text-slate-500 mt-1">
                Windows &amp; Linux — for Tier 1+ SDR nodes
              </p>
            </div>
            <div className="bg-surface/50 border border-border/50 rounded-xl p-6 opacity-60">
              <h4 className="font-medium text-slate-300">iOS</h4>
              <p className="text-sm text-slate-500 mt-1">
                iPhone app — coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="text-left bg-surface/30 border border-border/30 rounded-xl p-6">
          <h3 className="font-medium text-slate-300 mb-3">Requirements</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#x2713;</span>
              Android 8.0 (API 26) or higher
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#x2713;</span>
              Location permissions for signal observation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#x2713;</span>
              Internet connection for data upload
            </li>
          </ul>
        </div>

        <p className="text-sm text-slate-500">
          Need help?{" "}
          <Link
            href="/guides/quickstart"
            className="text-amber-500 hover:text-amber-400 underline"
          >
            Read the quickstart guide
          </Link>
        </p>
      </div>
    </section>
  );
}
