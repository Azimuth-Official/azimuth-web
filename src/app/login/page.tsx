"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      if (mode === "register" && password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      try {
        const endpoint =
          mode === "login"
            ? "/api/auth/web/login"
            : "/api/auth/web/register";

        const body: { email: string; password: string; referral_code?: string } = { email, password };
        if (mode === "register" && referralCode) {
          body.referral_code = referralCode;
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Authentication failed");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      } catch {
        setError("Network error — please try again");
        setLoading(false);
      }
    },
    [email, password, confirmPassword, referralCode, mode, router],
  );

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/web/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Google sign-in failed");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      } catch {
        setError("Network error — please try again");
        setLoading(false);
      }
    },
    [router],
  );

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      const google = (window as unknown as { google?: { accounts: { id: { initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void; renderButton: (element: HTMLElement, config: { theme: string; size: string; width: number; text: string }) => void } } } }).google;
      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      if (googleButtonRef.current) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_black",
          size: "large",
          width: 360,
          text: "signin_with",
        });
      }
    };

    // Try immediately (script may already be loaded)
    initGoogle();
    // Also set up for when script loads
    (window as unknown as Record<string, unknown>).__azimuthGoogleInit = initGoogle;
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            const init = (window as unknown as Record<string, unknown>).__azimuthGoogleInit;
            if (typeof init === "function") (init as () => void)();
          }}
        />
      )}

      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Sign up to start monitoring"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-slate-400 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-slate-400 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
              placeholder="Minimum 8 characters"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  placeholder="Repeat password"
                />
              </div>

              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-sm text-slate-400 mb-1.5"
                >
                  Referral Code (Optional)
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  placeholder="Enter a referral code if you have one"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-navy font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-slate-500">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div ref={googleButtonRef} className="flex justify-center" />
          </>
        )}

        {/* Toggle mode */}
        <p className="text-center text-sm text-slate-400 mt-6">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-slate-600 mt-4">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
