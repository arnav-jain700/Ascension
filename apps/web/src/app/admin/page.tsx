"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("/api/v1/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Backend server not responding. Please start the backend server.");
      } else {
        setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Dashboard</h1>
          <p className="mt-1 text-sm text-asc-charcoal">
            Welcome to your Ascension admin dashboard
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-3">
                  <button
                    onClick={fetchDashboardData}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                  <a
                    href="/admin/login"
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Back to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-asc-matte mb-4">Quick Start Guide</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-asc-matte text-white text-xs rounded-full font-bold">1</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-asc-matte">Start the Backend Server</p>
                <p className="text-xs text-asc-charcoal">Run: <code className="bg-asc-sand-muted px-2 py-1 rounded">npm run dev:backend</code></p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-asc-matte text-white text-xs rounded-full font-bold">2</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-asc-matte">Or Start Both Services</p>
                <p className="text-xs text-asc-charcoal">Run: <code className="bg-asc-sand-muted px-2 py-1 rounded">npm run dev:full</code></p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-asc-matte text-white text-xs rounded-full font-bold">3</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-asc-matte">Refresh This Page</p>
                <p className="text-xs text-asc-charcoal">Backend will be available at http://localhost:5000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-asc-charcoal">No dashboard data available</p>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: "+8%",
      changeType: "increase",
    },
    {
      name: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      change: "+15%",
      changeType: "increase",
    },
    {
      name: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: ChartBarIcon,
      change: "+3%",
      changeType: "increase",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-asc-matte">Dashboard</h1>
        <p className="mt-1 text-sm text-asc-charcoal">
          Welcome to your Ascension admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-asc-matte" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-asc-charcoal truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-asc-matte">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-asc-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-asc-matte">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-asc-charcoal">
                        {order.user?.name || "Unknown Customer"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-asc-matte">
                        ₹{order.total?.toLocaleString()}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-asc-charcoal">No recent orders</p>
              )}
            </div>
            <div className="mt-4">
              <a
                href="/admin/orders"
                className="text-sm font-medium text-asc-matte hover:text-asc-charcoal"
              >
                View all orders →
              </a>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-medium text-asc-matte">
                Low Stock Alerts
              </h3>
              {stats.lowStockProducts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {stats.lowStockProducts.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2 border-b border-asc-border last:border-0"
                  >
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-asc-matte">
                          {product.product?.name}
                        </p>
                        <p className="text-xs text-asc-charcoal">
                          SKU: {product.product?.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-asc-matte">
                        {product.availableQuantity} left
                      </p>
                      <p className="text-xs text-asc-charcoal">
                        Reorder at {product.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-asc-charcoal">
                  All products are well stocked
                </p>
              )}
            </div>
            <div className="mt-4">
              <a
                href="/admin/products?filter=low-stock"
                className="text-sm font-medium text-asc-matte hover:text-asc-charcoal"
              >
                Manage inventory →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
