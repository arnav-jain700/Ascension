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
      
      {/* Business Compliance Section */}
      <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-asc-matte mb-6">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-asc-matte mb-3">Legal Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Udyam Registration:</span>
                <span className="font-medium">UDYAM-MH-2024-001234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">GSTIN:</span>
                <span className="font-medium">29ABCDE1234F1ZV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">PAN:</span>
                <span className="font-medium">ABCDE1234F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Trademark Status:</span>
                <span className="font-medium text-green-600">Registered</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-asc-matte mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Business Name:</span>
                <span className="font-medium">Ascension Apparel Pvt. Ltd.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Email:</span>
                <span className="font-medium">info@ascension.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Phone:</span>
                <span className="font-medium">+91 98765 43210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Address:</span>
                <span className="font-medium">123 Business Park, Mumbai, Maharashtra 400001, India</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-asc-sand-muted rounded-md">
          <h3 className="font-medium text-asc-matte mb-3">GST Compliance</h3>
          <p className="text-sm text-asc-charcoal leading-relaxed">
            We are GST-registered business and comply with all Indian tax regulations. 
            All prices on our platform are inclusive of applicable GST as per government guidelines.
          </p>
        </div>
      </div>

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
