"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Check if user has admin role
      if (data.data.user.role !== "ADMIN" && data.data.user.role !== "SUPER_ADMIN") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Store authentication data
      localStorage.setItem("admin_token", data.data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.data.user));

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-asc-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-asc-matte">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-asc-matte">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-asc-charcoal">
            Sign in to manage your Ascension store
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-asc-matte">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm placeholder-asc-charcoal-muted focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="admin@ascension.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-asc-matte">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-asc-border-strong rounded-md shadow-sm placeholder-asc-charcoal-muted focus:outline-none focus:ring-2 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-asc-charcoal-muted" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-asc-charcoal-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-asc-matte hover:bg-asc-charcoal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-asc-matte disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-asc-charcoal hover:text-asc-matte transition-colors"
            >
              ← Back to store
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
