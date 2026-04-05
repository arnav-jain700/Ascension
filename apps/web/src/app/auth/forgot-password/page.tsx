"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual password reset API call
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-asc-matte mb-2">
            Reset Email Sent
          </h1>
          <p className="text-asc-charcoal mb-6">
            We&apos;ve sent a password reset link to your email address. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md bg-asc-matte px-6 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-2">
          Forgot Password
        </h1>
        <p className="text-asc-charcoal">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="bg-asc-canvas rounded-lg border border-asc-border p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      <p className="text-center mt-8 text-asc-charcoal">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-asc-accent hover:text-asc-matte transition-colors"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
