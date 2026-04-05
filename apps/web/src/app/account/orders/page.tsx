"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AccountSection, SecondaryButton } from "@/components/account-section";
import { OrderDetailsModal } from "@/components/order-details-modal";
import Link from "next/link";

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

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ASC-2024-001",
    date: "2024-01-15",
    total: 2598,
    status: "delivered",
    items: [
      {
        id: "1-1",
        name: "Men's Essential Tee",
        slug: "mens-essential-tee",
        variant: { size: "M", color: "black" },
        quantity: 2,
        price: 1299,
        image: "/placeholder-product.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
    },
    trackingNumber: "TRACK123456789",
    estimatedDelivery: "2024-01-18",
  },
  {
    id: "2",
    orderNumber: "ASC-2024-002",
    date: "2024-01-20",
    total: 3798,
    status: "shipped",
    items: [
      {
        id: "2-1",
        name: "Women's Essential Tee",
        slug: "womens-essential-tee",
        variant: { size: "L", color: "black" },
        quantity: 1,
        price: 1299,
        image: "/placeholder-product.jpg",
      },
      {
        id: "2-2",
        name: "Women's Joggers",
        slug: "womens-joggers",
        variant: { size: "M", color: "gray" },
        quantity: 1,
        price: 2499,
        image: "/placeholder-product.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
    },
    trackingNumber: "TRACK987654321",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "3",
    orderNumber: "ASC-2024-003",
    date: "2024-01-25",
    total: 1299,
    status: "processing",
    items: [
      {
        id: "3-1",
        name: "Men's Joggers",
        slug: "mens-joggers",
        variant: { size: "L", color: "navy" },
        quantity: 1,
        price: 2499,
        image: "/placeholder-product.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
    },
  },
];

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await fetch("/api/v1/orders", {
        //   headers: {
        //     "Authorization": `Bearer ${localStorage.getItem("ascension-auth-token")}`,
        //   },
        // });
        
        // Simulate API call with mock data
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-asc-charcoal">
            Please <a href="/auth/login" className="text-asc-accent hover:text-asc-matte transition-colors">sign in</a> to view your orders.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AccountSection
        title="Orders & invoices"
        description="Track shipments and download GST invoices for completed purchases."
      >
        <div className="text-center py-8">
          <p className="text-asc-charcoal">Loading your orders...</p>
        </div>
      </AccountSection>
    );
  }

  if (error) {
    return (
      <AccountSection
        title="Orders & invoices"
        description="Track shipments and download GST invoices for completed purchases."
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      </AccountSection>
    );
  }

  if (orders.length === 0) {
    return (
      <AccountSection
        title="Orders & invoices"
        description="Track shipments and download GST invoices for completed purchases."
      >
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-asc-charcoal"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-asc-matte mb-2">No orders yet</h3>
          <p className="text-asc-charcoal mb-6">
            You haven&apos;t placed any orders yet. Start shopping to see your order history here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-asc-matte px-6 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal"
          >
            Start Shopping
          </Link>
        </div>
      </AccountSection>
    );
  }

  return (
    <AccountSection
      title="Orders & invoices"
      description="Track shipments and download GST invoices for completed purchases."
    >
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-asc-border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="font-semibold text-asc-matte">{order.orderNumber}</h3>
                <p className="text-sm text-asc-charcoal">Placed on {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="font-semibold text-asc-matte">₹{order.total.toLocaleString()}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-asc-border rounded-md overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-asc-matte">{item.name}</h4>
                    <p className="text-sm text-asc-charcoal">
                      Size: {item.variant.size} • Color: {item.variant.color} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-asc-matte">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping & Tracking */}
            <div className="border-t border-asc-border pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm font-medium text-asc-matte mb-1">Shipping Address</p>
                  <p className="text-sm text-asc-charcoal">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                </div>
                
                {order.trackingNumber && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-asc-matte mb-1">Tracking Number</p>
                    <p className="text-sm text-asc-charcoal mb-2">{order.trackingNumber}</p>
                    {order.estimatedDelivery && (
                      <p className="text-sm text-asc-charcoal">
                        Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-asc-border">
              <button
                onClick={() => setSelectedOrder(order)}
                className="text-sm text-asc-accent hover:text-asc-matte transition-colors"
              >
                View Details
              </button>
              {order.status === "delivered" && (
                <SecondaryButton type="button">
                  Download Invoice
                </SecondaryButton>
              )}
              {order.trackingNumber && (
                <SecondaryButton type="button">
                  Track Package
                </SecondaryButton>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </AccountSection>
  );
}
