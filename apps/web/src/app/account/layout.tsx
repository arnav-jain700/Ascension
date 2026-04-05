import type { ReactNode } from "react";
import Link from "next/link";
import { AccountSidebar } from "@/components/account-sidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <p className="text-sm text-neutral-600">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong" aria-hidden>
          /
        </span>
        <span className="text-asc-matte">Account</span>
      </p>
      <div className="flex flex-1 flex-col gap-8 md:flex-row md:gap-10">
        <AccountSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
