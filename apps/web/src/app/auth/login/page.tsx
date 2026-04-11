"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const router = useRouter();
  const { login, updateUser } = useAuth(); // We might need to manually set user if 2FA passes but let's see. Wait, login from useAuth doesn't handle 2FA completion. We need to do it natively here.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (requires2FA && tempToken) {
        // Complete 2FA Login
        const response = await fetch("/api/v1/auth/2fa/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempToken, code: twoFactorCode })
        });
        
        if (response.ok) {
          const json = await response.json();
          // We must update localStorage and context manually since `useAuth` login method doesn't do 2FA completion natively
          localStorage.setItem("ascension-auth-token", json.data.sessionToken);
          localStorage.setItem("ascension-user", JSON.stringify(json.data.user));
          // Hard reload the page to initialize the context payload natively
          window.location.href = "/account";
        } else {
          setError("Invalid authenticator code. Please try again.");
        }
      } else {
        // Standard Login Trigger
        const result = await login(email, password);
        
        if (result.success) {
          if (result.requires2FA) {
            setRequires2FA(true);
            setTempToken(result.tempToken || null);
          } else {
            router.push("/account");
          }
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-2">
          Sign In
        </h1>
        <p className="text-asc-charcoal">
          Welcome back to Ascension
        </p>
      </div>

      <div className="bg-asc-canvas rounded-lg border border-asc-border p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!requires2FA ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-asc-matte mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-asc-matte mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-asc-accent border-asc-border rounded focus:ring-asc-accent"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-asc-charcoal">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-asc-accent hover:text-asc-matte transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-asc-charcoal mb-4">Your account is fortified with Two-Factor Authentication. Please enter the tracking code assigned to your device.</p>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-asc-matte mb-2">
                Authenticator Code
              </label>
              <input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                maxLength={6}
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent text-center tracking-widest text-lg font-mono"
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (requires2FA && twoFactorCode.length !== 6)}
            className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? "Authenticating..." : requires2FA ? "Verify Code" : "Sign In"}
          </button>
        </form>
      </div>

      <p className="text-center mt-8 text-asc-charcoal">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-asc-accent hover:text-asc-matte transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
