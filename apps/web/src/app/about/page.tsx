import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        About
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-asc-matte sm:text-4xl">About Ascension</h1>
      <p className="mt-6 leading-relaxed text-asc-charcoal">
        Ascension is a premium direct-to-consumer athleisure brand focused on t-shirts and joggers.
        We design for clarity of form, honest materials, and everyday wear — minimalist, mobile-first,
        and built for the long run.
      </p>
      <p className="mt-8 text-sm text-asc-charcoal">
        Read more on our{" "}
        <a
          href="https://ascensionapparel.blogspot.com/"
          className="font-medium text-asc-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          blog
        </a>
        .
      </p>
      <ul className="mt-10 flex flex-wrap gap-4 text-sm">
        <li>
          <Link href="/contact" className="font-medium text-asc-accent hover:underline">
            Contact
          </Link>
        </li>
        <li>
          <Link href="/terms" className="font-medium text-asc-accent hover:underline">
            Terms
          </Link>
        </li>
        <li>
          <Link href="/privacy" className="font-medium text-asc-accent hover:underline">
            Privacy
          </Link>
        </li>
      </ul>
      <p className="mt-12">
        <Link
          href="/products"
          className="text-sm font-medium text-asc-accent underline-offset-4 hover:underline"
        >
          Continue to shop
        </Link>
      </p>
    </div>
  );
}
