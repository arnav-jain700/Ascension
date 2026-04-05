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
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      
      if (success) {
        // Redirect to account page or intended destination
        router.push("/account");
      } else {
        setError("Invalid email or password. Please try again.");
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
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
