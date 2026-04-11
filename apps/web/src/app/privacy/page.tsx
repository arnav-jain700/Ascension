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
          At Ascension, we are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@ascension.com.
        </p>
        <p>
          This privacy notice describes how we might use your information if you:
        </p>
        <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
          <li>Visit our website at Ascension or any website of ours that links to this privacy notice</li>
          <li>Engage with us in other related ways, including any sales, marketing, or events</li>
        </ul>
        
        <h2 className="text-lg font-semibold text-asc-matte">1. What Information Do We Collect?</h2>
        <p>
          <strong>Personal information you disclose to us:</strong> We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
        </p>
        <p>
          The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following:
        </p>
        <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
          <li><strong>Personal Details:</strong> Names, phone numbers, email addresses, mailing addresses, usernames, billing addresses, and other similar information.</li>
          <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number and the security code associated with your payment instrument. All payment data is stored by our secure payment gateway providers (Razorpay/Stripe). You can find their privacy notice link(s) on their respective websites.</li>
        </ul>

        <h2 className="text-lg font-semibold text-asc-matte">2. How Do We Use Your Information?</h2>
        <p>
          We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations:
        </p>
        <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
          <li><strong>To facilitate account creation and logon process:</strong> If you choose to link your account with us to a third-party account (such as your Google or Facebook account), we use the information you allowed us to collect from those third parties to facilitate account creation and logon process for the performance of the contract.</li>
          <li><strong>To fulfill and manage your orders:</strong> We may use your information to fulfill and manage your orders, payments, returns, and exchanges made through the website.</li>
          <li><strong>To deliver and facilitate delivery of services to the user:</strong> We may use your information to provide you with the requested service (including tracking details).</li>
          <li><strong>To send administrative information to you:</strong> We may use your personal information to send you product, service and new feature information and/or information about changes to our terms, conditions, and policies.</li>
        </ul>

        <h2 className="text-lg font-semibold text-asc-matte">3. Will Your Information Be Shared With Anyone?</h2>
        <p>
          We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis:
        </p>
        <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
          <li><strong>Vendor and Third-Party Service Providers:</strong> We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., Courier services for shipping).</li>
        </ul>

        <h2 className="text-lg font-semibold text-asc-matte">4. Do We Use Cookies and Other Tracking Technologies?</h2>
        <p>
          We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">5. How Long Do We Keep Your Information?</h2>
        <p>
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">6. How Do We Keep Your Information Safe?</h2>
        <p>
          We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the website within a secure environment.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">7. Your Privacy Rights</h2>
        <p>
          Depending on your location, you may have rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.
        </p>
        <p>
          If you are residing in a region where the GDPR applies, and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority.
        </p>

        <h2 className="text-lg font-semibold text-asc-matte">8. Updates To This Notice</h2>
        <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>

        <h2 className="text-lg font-semibold text-asc-matte">9. Contact Us</h2>
        <p>
          If you have questions or comments about this notice, you may email us at <strong>privacy@ascension.com</strong> or by visiting our{" "}
          <Link href="/contact" className="font-medium text-asc-accent hover:underline">
            contact page
          </Link>.
        </p>
      </div>
    </div>
  );
}
