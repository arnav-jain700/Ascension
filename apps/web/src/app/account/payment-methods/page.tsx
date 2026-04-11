"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AccountSection, SecondaryButton } from "@/components/account-section";

interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking";
  provider: string;
  last4: string;
  brand: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  addedAt: string;
  upiId?: string;
  bankName?: string;
}



export default function AccountPaymentMethodsPage() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMethodType, setAddMethodType] = useState<"card" | "upi">("card");

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/v1/auth/profile/payment-methods", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
           setPaymentMethods(data.data.map((p: any) => ({
              id: p.id,
              type: p.type === "CARD" || p.type === "CREDIT_CARD" ? "card" : p.type === "UPI" ? "upi" : p.type === "NET_BANKING" ? "netbanking" : "cod",
              provider: p.provider || "Saved",
              last4: p.last4,
              brand: p.brand || "Payment Method",
              expiryMonth: p.expiryMonth,
              expiryYear: p.expiryYear,
              isDefault: p.isDefault,
              addedAt: p.createdAt,
              upiId: p.type === "UPI" ? p.token : undefined,
              bankName: p.type === "NET_BANKING" ? p.token : undefined
           })));
        } else {
           throw new Error();
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load payment methods. Please try again.");
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;

    try {
      const response = await fetch(`/api/v1/auth/profile/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}` }
      });
      if (!response.ok) throw new Error();
      
      const updatedMethods = paymentMethods.filter(method => method.id !== paymentMethodId);
      if (paymentMethods.find(method => method.id === paymentMethodId)?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedMethods);
    } catch (err) {
      setError("Failed to remove payment method. Please try again.");
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/v1/auth/profile/payment-methods/${paymentMethodId}/default`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}` }
      });
      if (!response.ok) throw new Error();

      const updatedMethods = paymentMethods.map(method =>
        method.id === paymentMethodId ? { ...method, isDefault: true } : { ...method, isDefault: false }
      );
      setPaymentMethods(updatedMethods);
    } catch (err) {
      setError("Failed to set default payment method. Please try again.");
    }
  };

  const getPaymentIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "card":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case "upi":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      case "netbanking":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="2" y="7" width="20" height="12" rx="2" ry="2" />
            <path d="M16 3v4M8 3v4M2 11h20" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPaymentDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case "card":
        return (
          <>
            <p className="text-sm text-asc-charcoal">
              {method.brand} ending in {method.last4}
            </p>
            {method.expiryMonth && method.expiryYear && (
              <p className="text-xs text-asc-charcoal">
                Expires {method.expiryMonth}/{method.expiryYear}
              </p>
            )}
          </>
        );
      case "upi":
        return (
          <>
            <p className="text-sm text-asc-charcoal">
              {method.provider} UPI
            </p>
            {method.upiId && (
              <p className="text-xs text-asc-charcoal">{method.upiId}</p>
            )}
          </>
        );
      case "netbanking":
        return (
          <>
            <p className="text-sm text-asc-charcoal">
              {method.bankName} NetBanking
            </p>
            <p className="text-xs text-asc-charcoal">Account ending in {method.last4}</p>
          </>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-asc-charcoal">
            Please <a href="/auth/login" className="text-asc-accent hover:text-asc-matte transition-colors">sign in</a> to manage your payment methods.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AccountSection
        title="Payment methods"
        description="Ascension never stores your full card number. Saved payment methods are tokenized and kept securely with payment providers."
      >
        <div className="text-center py-8">
          <p className="text-asc-charcoal">Loading your payment methods...</p>
        </div>
      </AccountSection>
    );
  }

  if (error) {
    return (
      <AccountSection
        title="Payment methods"
        description="Ascension never stores your full card number. Saved payment methods are tokenized and kept securely with payment providers."
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      </AccountSection>
    );
  }

  return (
    <AccountSection
      title="Payment methods"
      description="Ascension never stores your full card number. Saved payment methods are tokenized and kept securely with payment providers."
    >
      <div className="space-y-6">
        {/* Add New Payment Method */}
        {showAddForm ? (
          <div className="border border-asc-border rounded-md p-6">
            <h3 className="text-lg font-semibold text-asc-matte mb-4">Add Payment Details</h3>
               <form onSubmit={async (e) => {
                   e.preventDefault();
                   const formData = new FormData(e.currentTarget);
                   const type = formData.get("type");
                   const payload = {
                      type,
                      provider: formData.get("provider") || "Saved",
                      last4: formData.get("last4") || "****",
                      brand: "Saved Method",
                      upiId: type === "upi" ? formData.get("upiId") : undefined,
                      bankName: type === "netbanking" ? formData.get("bankName") : undefined,
                      isDefault: paymentMethods.length === 0
                   };
                   
                   const response = await fetch("/api/v1/auth/profile/payment-methods", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}` },
                      body: JSON.stringify(payload)
                   });
                   if (response.ok) {
                      window.location.reload();
                   } else {
                      setError("Failed to add payment method");
                   }
               }}>
                  <select name="type" value={addMethodType} onChange={(e) => setAddMethodType(e.target.value as any)} className="w-full mb-3 border border-asc-border text-sm p-3 rounded bg-asc-canvas focus:outline-none focus:ring-1" required>
                     <option value="card">Credit/Debit Card</option>
                     <option value="upi">UPI</option>
                  </select>
                  
                  {addMethodType === "card" ? (
                    <>
                      <input name="provider" placeholder="Card Issuer (e.g. Visa, Mastercard, HDFC)" className="w-full mb-3 border border-asc-border text-sm p-3 rounded bg-asc-canvas focus:outline-none focus:ring-1" required />
                      <input name="last4" placeholder="Last 4 Digits (Optional, e.g. 4242)" maxLength={4} className="w-full mb-4 border border-asc-border text-sm p-3 rounded bg-asc-canvas focus:outline-none focus:ring-1" />
                    </>
                  ) : (
                    <>
                      <input name="provider" placeholder="UPI App (e.g. PhonePe, Google Pay, Paytm)" className="w-full mb-3 border border-asc-border text-sm p-3 rounded bg-asc-canvas focus:outline-none focus:ring-1" required />
                      <input name="upiId" placeholder="UPI ID / VPA (e.g. name@okhdfcbank)" className="w-full mb-4 border border-asc-border text-sm p-3 rounded bg-asc-canvas focus:outline-none focus:ring-1" required />
                    </>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" className="bg-asc-matte text-white px-6 py-2 rounded text-sm font-medium hover:bg-asc-charcoal transition-colors">Save Method</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 rounded border border-asc-border text-sm font-medium hover:bg-asc-canvas transition-colors">Cancel</button>
                  </div>
               </form>
          </div>
        ) : (
          <div className="border border-asc-border border-dashed rounded-md p-6 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-asc-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <h3 className="text-lg font-semibold text-asc-matte mb-2">Add Payment Method</h3>
            <p className="text-asc-charcoal mb-4">
              You can manually add a payment method, or save one seamlessly during checkout. Your payment information is securely tokenized.
            </p>
            <SecondaryButton type="button" onClick={() => setShowAddForm(true)}>
              Add New Payment Method
            </SecondaryButton>
          </div>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-asc-charcoal"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <h3 className="text-lg font-semibold text-asc-matte mb-2">No saved payment methods</h3>
            <p className="text-asc-charcoal mb-6">
              You haven&apos;t saved any payment methods yet. Add a payment method during checkout for faster future purchases.
            </p>
            <SecondaryButton type="button" onClick={() => setShowAddForm(true)}>
              Add New Payment Method
            </SecondaryButton>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border border-asc-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-asc-canvas border border-asc-border rounded-md">
                      {getPaymentIcon(method.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-asc-matte capitalize">{method.type}</h3>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-asc-accent text-asc-canvas text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {getPaymentDetails(method)}
                      <p className="text-xs text-asc-charcoal mt-2">
                        Added on {new Date(method.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-asc-accent hover:text-asc-matte transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Information */}
        <div className="bg-asc-canvas border border-asc-border rounded-lg p-4">
          <h4 className="font-semibold text-asc-matte mb-2">🔒 Security Information</h4>
          <div className="space-y-2 text-sm text-asc-charcoal">
            <p>• <strong>PCI-DSS Compliant:</strong> Card data is tokenized by payment gateways</p>
            <p>• <strong>Secure Storage:</strong> We only store payment method references</p>
            <p>• <strong>Encrypted Transmission:</strong> All data is encrypted in transit</p>
            <p>• <strong>Provider Security:</strong> Payment methods are stored with Razorpay/Stripe</p>
            <p>• <strong>No Card Numbers:</strong> Full card details are never stored on our servers</p>
          </div>
        </div>


      </div>
    </AccountSection>
  );
}
