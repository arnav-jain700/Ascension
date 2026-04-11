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
          These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Ascension ("Company", “we”, “us”, or “our”), concerning your access to and use of the Ascension website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
        </p>
        <p>
          You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms and Conditions. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS AND CONDITIONS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">1. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">2. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms and Conditions; (4) you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">3. Products and Purchases</h2>
        <p>
           We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products. 
        </p>
        <p>
           All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">4. Purchases and Payment</h2>
        <p>
          We accept major Credit/Debit Cards, UPI, and authorized Net Banking gateways. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
        </p>
        <p>
          We reserve the right to refuse any order placed through the Site. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. 
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">5. Return Policy</h2>
        <p>
          Please review our Return Policy posted on the Site prior to making any purchases. All returns and exchanges must be formally requested within 14 days of delivery.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">6. Limitations of Liability</h2>
        <p>
          IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">7. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <strong>legal@ascension.com</strong> or via the {" "}
          <Link href="/contact" className="font-medium text-asc-accent hover:underline">
            Contact us
          </Link> page.
        </p>
      </div>
    </div>
  );
}
