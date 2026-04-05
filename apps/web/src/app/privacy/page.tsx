import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        Privacy policy
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-asc-matte sm:text-4xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-asc-charcoal">Last updated: {new Date().toISOString().slice(0, 10)}</p>
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-asc-charcoal">
        <p>
          Ascension respects your privacy. This policy describes how we collect and use information when you
          use our website. Replace this draft with a version reviewed for your jurisdictions (e.g. India
          DPDP where applicable).
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Information we collect</h2>
        <p>
          We may collect account details (name, email, phone), order and shipping information, and technical
          data such as device and browser type. Payment information is handled by our payment providers using
          tokenization; we do not store full card numbers on our servers.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">How we use information</h2>
        <p>
          To process orders, communicate about purchases, improve the site, comply with law, and send
          marketing only where you have opted in.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Cookies &amp; analytics</h2>
        <p>
          We may use cookies and similar technologies for essential site function and analytics. You can
          control cookies through your browser settings.
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Your rights</h2>
        <p>
          Depending on applicable law, you may request access, correction, or deletion of personal data.
          Contact us using the details on the{" "}
          <Link href="/contact" className="font-medium text-asc-accent hover:underline">
            contact page
          </Link>
          .
        </p>
        <h2 className="text-lg font-semibold text-asc-matte">Changes</h2>
        <p>We may update this policy and will revise the “Last updated” date when we do.</p>
      </div>
    </div>
  );
}
