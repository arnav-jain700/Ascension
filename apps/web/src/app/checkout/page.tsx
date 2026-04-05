"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

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

const mockAddresses: Address[] = [
  {
    id: "1",
    name: "Home",
    line1: "123 Main Street, Apt 4B",
    line2: "",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    phone: "9876543210",
    isDefault: true,
    type: "shipping",
  },
  {
    id: "2",
    name: "Office",
    line1: "456 Business Park, Building 2",
    line2: "10th Floor, Wing A",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    phone: "9876543210",
    isDefault: false,
    type: "shipping",
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "card",
    provider: "visa",
    last4: "4242",
    brand: "Visa",
    expiryMonth: "12",
    expiryYear: "2025",
    isDefault: true,
  },
  {
    id: "2",
    type: "upi",
    provider: "paytm",
    last4: "3210",
    brand: "UPI",
    isDefault: false,
  },
  {
    id: "3",
    type: "cod",
    provider: "cash",
    last4: "0000",
    brand: "Cash on Delivery",
    isDefault: false,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
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

  const subtotal = getTotalPrice();
  const shipping: number = subtotal > 0 ? 0 : 0; // Free shipping
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // Load addresses and payment methods
    setAddresses(mockAddresses);
    setPaymentMethods(mockPaymentMethods);
    
    // Set default selections
    const defaultAddress = mockAddresses.find(addr => addr.isDefault);
    const defaultPayment = mockPaymentMethods.find(pm => pm.isDefault);
    setSelectedAddress(defaultAddress || null);
    setSelectedPayment(defaultPayment || null);
  }, [user, items, router]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setStep(2);
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      setError("Please select both address and payment method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        subtotal,
        shipping,
        tax,
        total,
        notes: orderNotes,
      };

      // TODO: Implement actual API call
      // const response = await fetch("/api/v1/orders", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
      //   },
      //   body: JSON.stringify(orderData),
      // });

      // Simulate order processing
      setProcessingPayment(true);
      
      if (selectedPayment.type === "cod") {
        // Cash on delivery - immediate success
        setTimeout(() => {
          setSuccess(true);
          clearCart();
          setLoading(false);
          setProcessingPayment(false);
        }, 2000);
      } else {
        // Card/UPI payment processing
        setTimeout(() => {
          setSuccess(true);
          clearCart();
          setLoading(false);
          setProcessingPayment(false);
        }, 3000);
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
                {addresses.map((address) => (
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
                ))}
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

            {/* Pricing */}
            <div className="space-y-2 border-t border-asc-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Subtotal</span>
                <span className="font-medium text-asc-matte">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Shipping</span>
                <span className="font-medium text-asc-matte">
                  {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Tax (18% GST)</span>
                <span className="font-medium text-asc-matte">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-asc-border pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-asc-matte">Total</span>
                  <span className="font-bold text-lg text-asc-matte">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress}
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
                  onClick={handlePlaceOrder}
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
    </div>
  );
}
