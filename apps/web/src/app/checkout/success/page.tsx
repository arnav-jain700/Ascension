"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { downloadInvoicePDF, InvoiceData } from "@/lib/pdf-invoice";
import { calculateGST } from "@/lib/gst";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderId = searchParams.get('order');
    const savedOrder = localStorage.getItem(`order_${orderId}`);
    
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    }
  }, [searchParams]);

  const handleDownloadInvoice = async () => {
    if (!orderData) return;
    
    setLoading(true);
    try {
      const gstCalculation = calculateGST(
        orderData.subtotal,
        orderData.shippingAddress.state,
        'clothing'
      );

      const invoiceData: InvoiceData = {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customer.name,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        billingAddress: orderData.billingAddress,
        items: orderData.items.map((item: any) => {
          const itemPrice = Number(item.price || item.variant?.price || 0);
          return {
            name: item.name,
            quantity: item.quantity,
            price: itemPrice,
            total: itemPrice * item.quantity
          };
        }),
        subtotal: orderData.subtotal,
        cgst: gstCalculation.cgst,
        sgst: gstCalculation.sgst,
        igst: gstCalculation.igst,
        totalGST: gstCalculation.totalGST,
        total: orderData.total,
        orderDate: new Date(orderData.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        businessDetails: {
          name: "Ascension",
          email: "info@ascension.com",
          phone: "+91 98765 43210",
          gstin: "29ABCDE1234F1ZV",
          pan: "ABCDE1234F",
          address: "123 Business Park, Mumbai, Maharashtra 400001"
        }
      };

      downloadInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
          <p className="mt-4 text-asc-charcoal">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asc-canvas">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L16 7l-7 7-7 7 7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-asc-matte mb-2">Order Confirmed!</h1>
          <p className="text-lg text-asc-charcoal mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-asc-charcoal">
            Order Number: <span className="font-mono font-semibold">{orderData.orderNumber}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-asc-matte mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-asc-matte mb-2">Shipping Address</h3>
              <div className="text-asc-charcoal">
                <p className="font-medium">{orderData.shippingAddress.name}</p>
                <p>{orderData.shippingAddress.line1}</p>
                {orderData.shippingAddress.line2 && <p>{orderData.shippingAddress.line2}</p>}
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}</p>
                <p>{orderData.shippingAddress.country}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-asc-matte mb-2">Payment Method</h3>
              <div className="text-asc-charcoal">
                <p className="capitalize">{orderData.paymentMethod.replace('_', ' ')}</p>
                <p className="text-green-600 font-medium">Paid Successfully</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-asc-border pt-4">
            <h3 className="font-medium text-asc-matte mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderData.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-asc-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-asc-matte">{item.name}</h4>
                    <p className="text-sm text-asc-charcoal">
                      {item.variant?.size || "OS"} • {item.variant?.color || "Default"} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-asc-matte">₹{Number(item.price || item.variant?.price || 0).toLocaleString('en-IN')}</p>
                    <p className="text-sm text-asc-charcoal">× {item.quantity}</p>
                    <p className="font-semibold text-asc-matte">₹{(Number(item.price || item.variant?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-asc-border pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Subtotal:</span>
                <span className="font-medium">₹{orderData.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Shipping:</span>
                <span className="font-medium">
                  {orderData.shipping === 0 ? 'FREE' : `₹${orderData.shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-asc-charcoal">Total:</span>
                <span className="font-bold text-lg">₹{orderData.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleDownloadInvoice}
            disabled={loading}
            className="flex-1 flex items-center justify-center px-6 py-3 border border-asc-border text-asc-matte rounded-md hover:bg-asc-matte hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {loading ? 'Generating...' : 'Download Invoice'}
          </button>
          
          <button
            onClick={() => router.push('/products')}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-asc-matte text-white rounded-md hover:bg-asc-charcoal transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => router.push('/')} 
            className="text-asc-charcoal hover:text-asc-matte font-medium underline underline-offset-4 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-asc-canvas">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
