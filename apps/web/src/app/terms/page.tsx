import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        Terms &amp; conditions
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-asc-matte sm:text-4xl">
        Terms &amp; conditions
      </h1>
      <p className="mt-4 text-sm text-asc-charcoal">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-asc-charcoal">
        <p>
          These terms govern your use of the Ascension website and purchases made through it. This is a
          starter template — replace with counsel-reviewed terms before launch.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Use of the site</h2>
        <p>
          You agree to use the site only for lawful purposes. Product descriptions, prices, and availability
          may change without notice. We reserve the right to refuse or cancel orders where necessary.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Orders &amp; payment</h2>
        <p>
          Placing an order constitutes an offer to purchase. Payment is processed through our payment
          partners; card data is tokenized and not stored on Ascension servers.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Returns &amp; shipping</h2>
        <p>
          Policies for returns, exchanges, and shipping will be published here. Configure copy to match your
          operational policy.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Limitation of liability</h2>
        <p>
          To the extent permitted by law, Ascension is not liable for indirect or consequential damages
          arising from use of the site or products.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Contact</h2>
        <p>
          Questions about these terms: see{" "}
          <Link href="/contact" className="font-medium text-asc-accent hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
