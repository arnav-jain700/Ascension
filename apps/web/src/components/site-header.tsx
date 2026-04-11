"use client";

import Link from "next/link";
import { SITE_BLOG_URL } from "@/lib/site";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { CartDrawer } from "@/components/cart-drawer";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const getNavLinkClass = (isTransparent: boolean) =>
  `whitespace-nowrap text-sm font-medium transition-colors ${
    isTransparent
      ? "text-white/80 hover:text-white"
      : "text-asc-charcoal hover:text-asc-accent"
  }`;

export function SiteHeader() {
  const { getTotalItems, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const totalItems = getTotalItems();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const isTransparent = isHome && !isScrolled;

  const headerBgClass = isTransparent
    ? "bg-transparent border-transparent"
    : "bg-asc-canvas/95 backdrop-blur-sm border-asc-border";

  const iconBorderClass = isTransparent
    ? "border-white/30 text-white hover:border-white"
    : "border-asc-border-strong text-asc-matte hover:border-asc-accent hover:text-asc-accent";
    
  const logoTextClass = isTransparent
    ? "text-white hover:text-white/80"
    : "text-asc-matte hover:text-asc-accent";
    
  const userTextClass = isTransparent
    ? "text-white/90"
    : "text-asc-charcoal";
    
  const signoutClass = isTransparent
    ? "text-white/80 hover:text-white"
    : "text-asc-charcoal hover:text-asc-matte";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${headerBgClass}`}>
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] grid-rows-[auto_auto] gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:grid-rows-1 lg:items-center lg:gap-8 lg:py-4">
          <Link
            href="/"
            className={`col-start-1 row-start-1 text-lg font-semibold tracking-tight transition-colors ${logoTextClass}`}
            data-brand="ascension"
          >
            <span className="tracking-[0.2em]">ASCENSION</span>
          </Link>

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 lg:col-start-3 lg:row-start-1">
            <Link
              href="/wishlist"
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${iconBorderClass}`}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <WishlistIcon className="h-5 w-5" aria-hidden />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-asc-accent text-xs font-medium text-asc-canvas">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${iconBorderClass}`}
              aria-label="Shopping cart"
              title="Shopping cart"
            >
              <CartIcon className="h-5 w-5" aria-hidden />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-asc-accent text-xs font-medium text-asc-canvas">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
            <Link
              href="/account"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${iconBorderClass}`}
              aria-label="Account — profile, orders, and settings"
              title="Account"
            >
              <ProfileIcon className="h-5 w-5" aria-hidden />
            </Link>
          </div>

          <nav
            className={`col-span-2 row-start-2 flex gap-5 overflow-x-auto border-t pt-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:border-0 lg:pt-0 lg:[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:hidden ${
              isTransparent ? "border-white/10" : "border-asc-border"
            }`}
            aria-label="Primary"
          >
            <Link href="/products" className={getNavLinkClass(isTransparent)}>
              Shop all
            </Link>
            <Link href="/men" className={getNavLinkClass(isTransparent)}>
              Men
            </Link>
            <Link href="/women" className={getNavLinkClass(isTransparent)}>
              Women
            </Link>
            <a
              href={SITE_BLOG_URL}
              className={getNavLinkClass(isTransparent)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Blog
            </a>
          </nav>
        </div>
      </header>
      {!isHome && <div className="h-[110px] lg:h-[72px]" />}
      <CartDrawer />
    </>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.5c1.4-3.2 4.2-5 6.5-5s5.1 1.8 6.5 5" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L4 7h16l-2 5H6l-2-5H2" />
      <path d="M4 7h16" />
      <circle cx="8" cy="19" r="1" />
      <circle cx="16" cy="19" r="1" />
    </svg>
  );
}

function WishlistIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
