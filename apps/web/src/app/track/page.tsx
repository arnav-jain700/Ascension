"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, TruckIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const res = await fetch(`/api/v1/orders/track/${orderNumber.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not find your order.");
      }

      setTrackingData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING": return 0;
      case "PROCESSING": return 1;
      case "SHIPPED": return 2;
      case "DELIVERED": return 3;
      default: return 0; // Cancelled/Refunded handled separately
    }
  };

  const isCancelled = trackingData?.status === "CANCELLED" || trackingData?.status === "REFUNDED";
  const currentStep = getStatusStep(trackingData?.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 flex-1">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-asc-matte tracking-tight mb-4">Track Your Order</h1>
        <p className="text-asc-charcoal max-w-lg mx-auto">
          Enter your Ascension Order Number below to get real-time tracking updates and see exactly where your apparel is.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-asc-border p-6 md:p-10 mb-12">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="text"
            required
            placeholder="e.g. ASC-123456789"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 border border-asc-border rounded-md text-asc-matte outline-none focus:border-asc-matte focus:ring-1 focus:ring-asc-matte uppercase bg-asc-sand-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-asc-matte text-white font-medium rounded-md hover:bg-black transition-colors disabled:opacity-75 min-w-[140px]"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : "Track Package"}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 font-medium text-sm">{error}</p>}
      </div>

      {trackingData && (
        <div className="bg-white rounded-xl border border-asc-border overflow-hidden slide-down animate-in">
          {/* Header */}
          <div className="bg-asc-sand-muted p-6 border-b border-asc-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-asc-charcoal uppercase tracking-wider font-semibold mb-1">Order Number</p>
              <h2 className="text-xl font-bold text-asc-matte font-mono">{trackingData.orderNumber}</h2>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-asc-charcoal uppercase tracking-wider font-semibold mb-1">Order Date</p>
              <p className="text-asc-matte font-medium">{new Date(trackingData.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {isCancelled ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XMarkIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-asc-matte mb-2">Order Cancelled</h3>
                <p className="text-asc-charcoal">This order has been {trackingData.status.toLowerCase()}. Please contact support if you believe this is an error.</p>
              </div>
            ) : (
              <div className="relative max-w-2xl mx-auto">
                {/* Timeline Line */}
                <div className="absolute left-[21px] top-8 bottom-8 w-1 bg-asc-border hidden md:block rounded-full">
                  <div 
                    className="absolute top-0 left-0 w-full bg-asc-matte transition-all duration-1000"
                    style={{ height: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>

                <div className="space-y-8">
                  {/* Step 0: Confirmed */}
                  <div className="relative flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${currentStep >= 0 ? "bg-asc-matte text-white" : "bg-white border-2 border-asc-border text-asc-border-strong"}`}>
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <div className="pt-2">
                      <h4 className={`text-lg font-bold ${currentStep >= 0 ? "text-asc-matte" : "text-asc-charcoal-muted"}`}>Order Confirmed</h4>
                      <p className="text-sm text-asc-charcoal mt-1">We've received your order and payment.</p>
                    </div>
                  </div>

                  {/* Step 1: Processing */}
                  <div className="relative flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${currentStep >= 1 ? "bg-asc-matte text-white" : "bg-white border-2 border-asc-border text-asc-border-strong"}`}>
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <div className="pt-2">
                      <h4 className={`text-lg font-bold ${currentStep >= 1 ? "text-asc-matte" : "text-asc-charcoal-muted"}`}>Processing</h4>
                      <p className="text-sm text-asc-charcoal mt-1">Your items are being hand-picked and boxed.</p>
                    </div>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="relative flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${currentStep >= 2 ? "bg-asc-matte text-white" : "bg-white border-2 border-asc-border text-asc-border-strong"}`}>
                      <TruckIcon className="w-6 h-6" />
                    </div>
                    <div className="pt-2">
                      <h4 className={`text-lg font-bold ${currentStep >= 2 ? "text-asc-matte" : "text-asc-charcoal-muted"}`}>Shipped</h4>
                      <p className="text-sm text-asc-charcoal mt-1">Your package has been handed over to our delivery partners.</p>
                      {currentStep >= 2 && trackingData.trackingNumber && (
                        <div className="mt-3 bg-asc-sand-muted border border-asc-border p-3 rounded-md inline-block">
                          <p className="text-xs uppercase font-semibold text-asc-charcoal mb-1">Carrier: {trackingData.carrier || "Standard Shipping"}</p>
                          <p className="text-asc-matte font-mono font-medium">{trackingData.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="relative flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${currentStep >= 3 ? "bg-asc-matte text-white" : "bg-white border-2 border-asc-border text-asc-border-strong"}`}>
                      <MapPinIcon className="w-6 h-6" />
                    </div>
                    <div className="pt-2">
                      <h4 className={`text-lg font-bold ${currentStep >= 3 ? "text-asc-matte" : "text-asc-charcoal-muted"}`}>Delivered</h4>
                      <p className="text-sm text-asc-charcoal mt-1">Your package has arrived at its destination.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="bg-asc-sand-muted border-t border-asc-border p-6">
            <h4 className="text-sm uppercase tracking-wider font-semibold text-asc-charcoal mb-4">Items in this Package</h4>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {trackingData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 bg-white p-3 rounded-md border border-asc-border min-w-[250px]">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-asc-sand" />
                  <div>
                    <p className="text-sm font-semibold text-asc-matte line-clamp-1">{item.name}</p>
                    <p className="text-xs text-asc-charcoal mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
