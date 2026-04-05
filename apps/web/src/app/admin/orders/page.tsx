"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  payment?: {
    status: string;
    method: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [search, status, page]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/v1/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.data.orders);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <XMarkIcon className="h-4 w-4" />;
      case "PROCESSING":
        return <CheckIcon className="h-4 w-4" />;
      case "SHIPPED":
        return <TruckIcon className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckIcon className="h-4 w-4" />;
      default:
        return <XMarkIcon className="h-4 w-4" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-asc-matte">Orders</h1>
        <p className="mt-1 text-sm text-asc-charcoal">
          Manage customer orders and fulfillment
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-asc-charcoal-muted" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-asc-border-strong rounded-md leading-5 bg-white placeholder-asc-charcoal-muted focus:outline-none focus:placeholder-asc-charcoal-muted focus:ring-1 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-asc-border-strong rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <div></div> {/* Empty div for grid layout */}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-asc-border">
            <thead className="bg-asc-sand-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-asc-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-asc-sand-muted">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-asc-matte">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-asc-charcoal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-asc-matte">
                        {order.user?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-asc-charcoal">
                        {order.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.payment?.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.payment?.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="text-asc-matte hover:text-asc-charcoal"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      
                      {/* Status Update Buttons */}
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as Processing"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {order.status === "PROCESSING" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                          className="text-purple-600 hover:text-purple-800"
                          title="Mark as Shipped"
                        >
                          <TruckIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {order.status === "SHIPPED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Delivered"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-asc-charcoal">No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white shadow rounded-lg px-4 py-3 flex items-center justify-between border-t border-asc-border sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-asc-border-strong text-sm font-medium rounded-md text-asc-charcoal bg-white hover:bg-asc-sand-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-asc-border-strong text-sm font-medium rounded-md text-asc-charcoal bg-white hover:bg-asc-sand-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-asc-charcoal">
                Showing page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-asc-border-strong bg-white text-sm font-medium text-asc-charcoal hover:bg-asc-sand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-asc-border-strong bg-white text-sm font-medium text-asc-charcoal hover:bg-asc-sand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
