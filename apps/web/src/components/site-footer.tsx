import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import { SITE_BLOG_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-asc-border bg-asc-sand-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold tracking-[0.2em] text-asc-matte">ASCENSION</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-asc-charcoal">
              Premium direct-to-consumer athleisure — t-shirts and joggers. Minimal by design.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-asc-charcoal">Follow us</p>
              <SocialLinks className="mt-3" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-asc-charcoal">Shop</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Shop all
                </Link>
              </li>
              <li>
                <Link href="/men" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/women" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Women
                </Link>
              </li>
              <li>
                <a
                  href={SITE_BLOG_URL}
                  className="text-asc-charcoal transition-colors hover:text-asc-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Blog
                </a>
              </li>
              <li>
                <Link href="/account" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-asc-charcoal">Company</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Terms &amp; conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-asc-charcoal transition-colors hover:text-asc-accent">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-asc-border pt-8">
          <p className="text-xs text-asc-charcoal/80">© {new Date().getFullYear()} Ascension. India.</p>
        </div>
      </div>
    </footer>
  );
}
