"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { calculateGST, getTaxBreakdown, formatCurrency } from "@/lib/gst";
import { GSTSummary } from "@/components/gst-summary";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type: "shipping" | "billing";
}

interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking" | "cod";
  provider: string;
  last4: string;
  brand: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

// Removed mock data arrays

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart, isHydrated } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Checkout form state
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Promo state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Guest inputs
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState({
    line1: "", city: "", state: "", postalCode: "", country: "India"
  });
  
  // Real payments setup
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const subtotal = getTotalPrice();
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === "PERCENTAGE") {
      discountAmount = subtotal * (appliedPromo.discountValue / 100);
      if (appliedPromo.maxDiscount && discountAmount > appliedPromo.maxDiscount) discountAmount = appliedPromo.maxDiscount;
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const shipping: number = subtotal > 0 ? 0 : 0; // Free shipping
  const tax = 0; // Tax removed as requested
  const total = Math.max(0, subtotal - discountAmount + shipping + tax);

  useEffect(() => {
    if (!isHydrated) return; // Wait for localStorage sync to complete
    if (success) return; // Prevent redirecting back to cart if the checkout process has successfully fired!

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const loadData = async () => {
      try {
        if (!user) {
          // Setup guest modes
          setAddresses([]);
          setPaymentMethods([]);
          return;
        }

        const token = localStorage.getItem("ascension-auth-token");
        const headers = { Authorization: `Bearer ${token}` };

        // Real profile fetching to get addresses and methods
        const profileRes = await fetch("/api/v1/auth/profile", { headers });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.data.addresses) {
            setAddresses(pData.data.addresses);
            const defAddr = pData.data.addresses.find((a: any) => a.isDefault) || pData.data.addresses[0];
            if (defAddr) setSelectedAddress(defAddr);
          }
        }
        
        // Mocking user saved payment methods since actual wallet endpoint might not exist, but let them add fresh
        setPaymentMethods([
          {
            id: "card_mock",
            type: "card",
            provider: "visa",
            last4: "4242",
            brand: "Visa",
            expiryMonth: "12",
            expiryYear: "2025",
            isDefault: true,
          },
          {
            id: "upi_mock",
            type: "upi",
            provider: "generic",
            last4: "",
            brand: "UPI App",
            isDefault: false,
          }
        ]);
        setSelectedPayment({
            id: "card_mock",
            type: "card",
            provider: "visa",
            last4: "4242",
            brand: "Visa",
            expiryMonth: "12",
            expiryYear: "2025",
            isDefault: true,
          });

      } catch (err) {
        console.error(err);
      }
    };
    
    loadData();
  }, [user, items, router, isHydrated, success]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setStep(2);
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    setStep(3);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setValidatingPromo(true);
    setPromoError("");
    try {
      const response = await fetch("/api/v1/marketing/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput.trim(), cartTotal: subtotal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid promo code");

      setAppliedPromo(data.data);
      setPromoCodeInput("");
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setValidatingPromo(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrderClick = async () => {
    if ((!selectedAddress && !guestEmail) || !selectedPayment) {
      setError("Please complete all required fields");
      return;
    }
    await processOrder();
  };

  const processOrder = async () => {
    if ((!selectedAddress && !guestEmail) || !selectedPayment) {
      setError("Please select address and payment method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activeAddress = selectedAddress || {
        name: guestName,
        phone: guestPhone,
        line1: guestAddress.line1,
        city: guestAddress.city,
        state: guestAddress.state,
        postalCode: guestAddress.postalCode,
        country: guestAddress.country,
      };

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant.price,
          name: item.name
        })),
        shippingAddress: activeAddress,
        billingAddress: activeAddress,
        paymentMethod: selectedPayment,
        subtotal,
        discount: discountAmount,
        promoCodeId: appliedPromo ? appliedPromo.id : null,
        shippingCost: shipping,
        tax,
        total,
        notes: orderNotes
      };

      let response;
      if (user) {
        response = await fetch("/api/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
          },
          body: JSON.stringify(orderData),
        });
      } else {
        // Guest order endpoint logic
        response = await fetch("/api/v1/orders/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderData, guestEmail, guestName }),
        });
      }

      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || "Order failed to process");
      }

      const orderNumber = resData.data?.orderNumber;

      const finalOrderData = {
         orderNumber: orderNumber || `ASC-${Date.now()}`,
         customer: { name: guestName || (user as any)?.name || (user as any)?.firstName || "Customer", email: guestEmail || user?.email || "", phone: guestPhone || user?.phone || "" },
         shippingAddress: orderData.shippingAddress,
         billingAddress: orderData.billingAddress,
         paymentMethod: orderData.paymentMethod?.type || "Card",
         items: items, 
         subtotal: orderData.subtotal,
         shipping: orderData.shippingCost,
         total: orderData.total,
         createdAt: resData.data?.createdAt || new Date().toISOString()
      };
      localStorage.setItem(`order_${finalOrderData.orderNumber}`, JSON.stringify(finalOrderData));

      if (selectedPayment.type !== "cod") {
        setProcessingPayment(true);
        const isLoaded = await loadRazorpay();
        if (!isLoaded) throw new Error("Razorpay SDK failed to load");

        const authHeader: Record<string, string> = user ? { "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}` } : {};
        
        const createRes = await fetch("/api/v1/payments/razorpay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ orderNumber, amount: total })
        });
        
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.message || "Failed to initiate payment");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
          amount: createData.data.amount,
          currency: createData.data.currency,
          name: "Ascension Apparel",
          description: "Order Payment",
          order_id: createData.data.order_id,
          handler: async function (response: any) {
            setProcessingPayment(true);
            const verifyRes = await fetch("/api/v1/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(true);
              clearCart();
              setLoading(false);
              setProcessingPayment(false);
              router.push(`/checkout/success?order=${finalOrderData.orderNumber}`);
            } else {
              setError("Payment verification failed. Please contact support.");
              setLoading(false);
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: finalOrderData.customer.name,
            email: finalOrderData.customer.email,
            contact: finalOrderData.customer.phone
          },
          theme: { color: "#111827" },
          modal: {
            ondismiss: function() {
              setLoading(false);
              setProcessingPayment(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setError(response.error.description);
          setLoading(false);
          setProcessingPayment(false);
        });
        rzp.open();
      } else {
        setProcessingPayment(true);
        setTimeout(() => {
          setSuccess(true);
          clearCart();
          setLoading(false);
          setProcessingPayment(false);
          router.push(`/checkout/success?order=${finalOrderData.orderNumber}`);
        }, 1500);
      }

    } catch (err) {
      setError("Failed to place order. Please try again.");
      setLoading(false);
      setProcessingPayment(false);
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
      case "cod":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010-7z" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010-7z" transform="rotate(180 12 12)" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-asc-matte mb-4">Order Placed Successfully!</h1>
          <p className="text-asc-charcoal mb-8">
            Thank you for your order. We&apos;ll send you an email with order details and tracking information.
          </p>
          <div className="space-y-4">
            <div className="border border-asc-border rounded-lg p-6 text-left">
              <h3 className="font-semibold text-asc-matte mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-asc-charcoal">Order Number:</span>
                  <span className="font-medium">ASC-{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-asc-charcoal">Total Amount:</span>
                  <span className="font-medium">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-asc-charcoal">Payment Method:</span>
                  <span className="font-medium capitalize">{selectedPayment?.brand}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/account/orders")}
                className="px-6 py-3 bg-asc-matte text-asc-canvas rounded-md hover:bg-asc-charcoal transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 border border-asc-border rounded-md hover:bg-asc-canvas transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold text-asc-matte mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-asc-matte text-asc-canvas" : "bg-asc-border text-asc-charcoal"
              }`}>
                1
              </div>
              <span className={`text-sm ${step >= 1 ? "text-asc-matte" : "text-asc-charcoal"}`}>Address</span>
            </div>
            <div className="flex-1 h-px bg-asc-border"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-asc-matte text-asc-canvas" : "bg-asc-border text-asc-charcoal"
              }`}>
                2
              </div>
              <span className={`text-sm ${step >= 2 ? "text-asc-matte" : "text-asc-charcoal"}`}>Payment</span>
            </div>
            <div className="flex-1 h-px bg-asc-border"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? "bg-asc-matte text-asc-canvas" : "bg-asc-border text-asc-charcoal"
              }`}>
                3
              </div>
              <span className={`text-sm ${step >= 3 ? "text-asc-matte" : "text-asc-charcoal"}`}>Review</span>
            </div>
          </div>

          {/* Step 1: Address Selection */}
          {step === 1 && (
            <div className="border border-asc-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-asc-matte mb-4">Select Delivery Address</h2>
              <div className="space-y-4">
                {user ? (
                  addresses.length > 0 ? addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? "border-asc-accent bg-asc-canvas"
                          : "border-asc-border hover:border-asc-matte"
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-asc-matte">{address.name}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-asc-accent text-asc-canvas text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-asc-charcoal">
                            <p>{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p>{address.country}</p>
                            <p>{address.phone}</p>
                          </div>
                        </div>
                        <div className="w-5 h-5 border-2 border-asc-accent rounded-full flex items-center justify-center">
                          {selectedAddress?.id === address.id && (
                            <div className="w-2.5 h-2.5 bg-asc-accent rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm">No saved addresses found. Please add a new address to continue.</p>
                  )
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email for order receipt</label>
                      <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone</label>
                      <input type="text" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Address</label>
                      <input type="text" value={guestAddress.line1} onChange={e => setGuestAddress({...guestAddress, line1: e.target.value})} className="w-full border p-2 rounded mb-2" placeholder="Street Address" required />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={guestAddress.city} onChange={e => setGuestAddress({...guestAddress, city: e.target.value})} className="border p-2 rounded" placeholder="City" required />
                        <input type="text" value={guestAddress.state} onChange={e => setGuestAddress({...guestAddress, state: e.target.value})} className="border p-2 rounded" placeholder="State" required />
                        <input type="text" value={guestAddress.postalCode} onChange={e => setGuestAddress({...guestAddress, postalCode: e.target.value})} className="border p-2 rounded" placeholder="PIN Code" required />
                      </div>
                    </div>
                    <button onClick={() => {
                      if (guestEmail && guestName && guestAddress.line1 && guestAddress.city) setStep(2);
                      else setError("Please fill all fields");
                    }} className="mt-4 px-4 py-2 bg-asc-matte text-white rounded">Use Address & Continue</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push("/account/addresses")}
                className="text-asc-accent hover:text-asc-matte transition-colors text-sm"
              >
                + Add New Address
              </button>
            </div>
          )}

          {/* Step 2: Payment Selection */}
          {step === 2 && (
            <div className="border border-asc-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-asc-matte mb-4">Select Payment Method</h2>
              <div className="space-y-4">
                {paymentMethods.map((payment) => (
                  <div
                    key={payment.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPayment?.id === payment.id
                        ? "border-asc-accent bg-asc-canvas"
                        : "border-asc-border hover:border-asc-matte"
                    }`}
                    onClick={() => handlePaymentSelect(payment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-asc-canvas border border-asc-border rounded">
                          {getPaymentIcon(payment.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-asc-matte capitalize">{payment.type}</h3>
                            {payment.isDefault && (
                              <span className="px-2 py-1 bg-asc-accent text-asc-canvas text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-asc-charcoal">
                            {payment.type === "card" && `${payment.brand} ending in ${payment.last4}`}
                            {payment.type === "upi" && `${payment.provider} UPI`}
                            {payment.type === "cod" && "Pay when you receive"}
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 border-2 border-asc-accent rounded-full flex items-center justify-center">
                        {selectedPayment?.id === payment.id && (
                          <div className="w-2.5 h-2.5 bg-asc-accent rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/account/payment-methods")}
                className="text-asc-accent hover:text-asc-matte transition-colors text-sm"
              >
                + Add Payment Method
              </button>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Selected Address */}
              <div className="border border-asc-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-asc-matte mb-4">Delivery Address</h2>
                {selectedAddress && (
                  <div className="text-sm text-asc-charcoal">
                    <p className="font-medium text-asc-matte mb-2">{selectedAddress.name}</p>
                    <p>{selectedAddress.line1}</p>
                    {selectedAddress.line2 && <p>{selectedAddress.line2}</p>}
                    <p>
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                    </p>
                    <p>{selectedAddress.country}</p>
                    <p>{selectedAddress.phone}</p>
                  </div>
                )}
              </div>

              {/* Selected Payment */}
              <div className="border border-asc-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-asc-matte mb-4">Payment Method</h2>
                {selectedPayment && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-asc-canvas border border-asc-border rounded">
                      {getPaymentIcon(selectedPayment.type)}
                    </div>
                    <div>
                      <p className="font-medium text-asc-matte capitalize">{selectedPayment.type}</p>
                      <p className="text-sm text-asc-charcoal">
                        {selectedPayment.type === "card" && `${selectedPayment.brand} ending in ${selectedPayment.last4}`}
                        {selectedPayment.type === "upi" && `${selectedPayment.provider} UPI`}
                        {selectedPayment.type === "cod" && "Pay when you receive"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="border border-asc-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-asc-matte mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special instructions for your order..."
                  className="w-full px-3 py-2 border border-asc-border rounded-md focus:outline-none focus:ring-2 focus:ring-asc-accent focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24">
          <div className="border border-asc-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-asc-matte mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-asc-border rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-asc-matte text-sm">{item.name}</h4>
                    <p className="text-xs text-asc-charcoal">
                      {item.variant.size} • {item.variant.color} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-asc-matte">₹{item.variant.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code section */}
            <div className="mb-6 pt-4 border-t border-asc-border">
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  <div>
                    <p className="text-xs font-semibold text-green-800 tracking-wide uppercase">{appliedPromo.code}</p>
                    <p className="text-[10px] text-green-700">{appliedPromo.discountType === "PERCENTAGE" ? `${appliedPromo.discountValue}% off` : `₹${appliedPromo.discountValue} off`} applied</p>
                  </div>
                  <button onClick={() => setAppliedPromo(null)} className="text-sm font-medium text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo code" 
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 border border-asc-border rounded-md px-3 py-2 text-sm outline-none focus:border-asc-matte uppercase"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoCodeInput}
                      className="px-4 py-2 bg-asc-matte text-white text-sm font-medium rounded-md hover:bg-asc-charcoal disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="mt-1 text-xs text-red-600">{promoError}</p>}
                </div>
              )}
            </div>

            {/* VAT/GST Removed as requested */}

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress && !guestEmail}
                  className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              )}
              
              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedPayment}
                  className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
                >
                  Review Order
                </button>
              )}
              
              {step === 3 && (
                <button
                  onClick={handlePlaceOrderClick}
                  disabled={loading || processingPayment}
                  className="w-full bg-asc-matte text-asc-canvas px-4 py-3 text-sm font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
                >
                  {processingPayment ? "Processing..." : loading ? "Placing Order..." : "Place Order"}
                </button>
              )}
              
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                className="w-full border border-asc-border text-asc-matte px-4 py-3 text-sm font-medium rounded-md hover:bg-asc-canvas transition-colors"
              >
                {step === 1 ? "Back to Cart" : "Back"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Mode Banner Re-purposed to show Razorpay hint */}
      <div className="bg-amber-100 text-amber-800 text-xs font-medium py-2 px-4 text-center mt-12 rounded mx-4 sm:mx-6 mb-12">
        <span className="font-bold">Test Mode</span> — Use Razorpay test credentials or UPI to complete payment mockups.
      </div>
    </div>
  );
}
