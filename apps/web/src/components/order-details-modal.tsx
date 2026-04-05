"use client";

import React from "react";

interface OrderItem {
  id: string;
  name: string;
  slug: string;
  variant: {
    size: string;
    color: string;
  };
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-asc-canvas rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-asc-canvas border-b border-asc-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-asc-matte">Order Details</h2>
              <p className="text-sm text-asc-charcoal">{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-asc-charcoal hover:text-asc-matte transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-asc-matte">Status</h3>
              <p className="text-sm text-asc-charcoal">Placed on {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-asc-matte mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-asc-border rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-asc-matte">{item.name}</h4>
                    <p className="text-sm text-asc-charcoal">
                      Size: {item.variant.size} • Color: {item.variant.color}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-asc-charcoal">Qty: {item.quantity}</p>
                      <p className="font-medium text-asc-matte">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold text-asc-matte mb-2">Shipping Address</h3>
            <div className="bg-asc-canvas border border-asc-border rounded-md p-4">
              <p className="text-asc-matte">{order.shippingAddress.name}</p>
              <p className="text-asc-charcoal">{order.shippingAddress.address}</p>
              <p className="text-asc-charcoal">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div>
              <h3 className="font-semibold text-asc-matte mb-2">Tracking Information</h3>
              <div className="bg-asc-canvas border border-asc-border rounded-md p-4">
                <p className="text-sm text-asc-charcoal mb-1">
                  <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-sm text-asc-charcoal">
                    <span className="font-medium">Estimated Delivery:</span>{" "}
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-asc-matte mb-2">Order Summary</h3>
            <div className="bg-asc-canvas border border-asc-border rounded-md p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Subtotal</span>
                <span className="text-asc-matte">₹{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Shipping</span>
                <span className="text-asc-matte">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-asc-charcoal">Tax</span>
                <span className="text-asc-matte">₹0</span>
              </div>
              <div className="border-t border-asc-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-asc-matte">Total</span>
                  <span className="font-bold text-lg text-asc-matte">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-asc-border">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-asc-border rounded-md text-sm font-medium text-asc-matte hover:bg-asc-canvas transition-colors"
            >
              Close
            </button>
            {order.status === "delivered" && (
              <button className="px-4 py-2 bg-asc-matte text-asc-canvas rounded-md text-sm font-medium hover:bg-asc-charcoal transition-colors">
                Download Invoice
              </button>
            )}
            {order.trackingNumber && (
              <button className="px-4 py-2 border border-asc-border rounded-md text-sm font-medium text-asc-matte hover:bg-asc-canvas transition-colors">
                Track Package
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
