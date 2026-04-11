"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/account/profile", label: "Profile & details" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders & invoices" },
  { href: "/account/rewards", label: "Loyalty Rewards" },
  { href: "/account/security", label: "Password" },
  { href: "/account/payment-methods", label: "Payment methods" },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <nav
        className="flex gap-2 overflow-x-auto border-b border-asc-border pb-3 md:hidden"
        aria-label="Account sections"
      >
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-asc-matte text-white"
                  : "bg-asc-sand-muted text-asc-charcoal hover:bg-asc-border-strong/60"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium bg-asc-sand-muted text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          Sign out
        </button>
      </nav>
      <nav
        className="hidden w-52 shrink-0 flex-col gap-1 border-r border-asc-border pr-6 md:flex"
        aria-label="Account sections"
      >
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-asc-matte text-white"
                  : "text-asc-charcoal hover:bg-asc-sand-muted hover:text-asc-matte"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <div className="mt-4 pt-4 border-t border-asc-border">
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
