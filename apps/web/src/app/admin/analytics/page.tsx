"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  ordersByStatus: Array<{
    status: string;
    _count: { status: number };
    _sum: { total: number };
  }>;
  topProducts: Array<{
    productId: string;
    _sum: { quantity: number; total: number };
  }>;
  salesByCategory: Array<{
    product: any;
    _sum: { quantity: number; total: number };
  }>;
  customerGrowth: Array<{
    createdAt: string;
    _count: { createdAt: number };
  }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/admin/analytics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    if (!analytics) return 0;
    return analytics.ordersByStatus.reduce((total, status) => {
      return total + (status._sum.total || 0);
    }, 0);
  };

  const calculateTotalOrders = () => {
    if (!analytics) return 0;
    return analytics.ordersByStatus.reduce((total, status) => {
      return total + status._count.status;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-asc-charcoal">No analytics data available</p>
      </div>
    );
  }

  const totalRevenue = calculateTotalRevenue();
  const totalOrders = calculateTotalOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Analytics</h1>
          <p className="mt-1 text-sm text-asc-charcoal">
            Track your business performance
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="block px-3 py-2 border border-asc-border-strong rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-asc-matte" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-asc-charcoal truncate">
                    Total Orders
                  </dt>
                  <dd className="text-2xl font-semibold text-asc-matte">
                    {totalOrders.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-asc-matte" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-asc-charcoal truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-asc-matte">
                    {formatCurrency(totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-asc-matte" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-asc-charcoal truncate">
                    New Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-asc-matte">
                    {analytics.customerGrowth.length.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-asc-matte" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-asc-charcoal truncate">
                    Avg Order Value
                  </dt>
                  <dd className="text-2xl font-semibold text-asc-matte">
                    {totalOrders > 0
                      ? formatCurrency(totalRevenue / totalOrders)
                      : formatCurrency(0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4">
              Orders by Status
            </h3>
            <div className="space-y-3">
              {analytics.ordersByStatus.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between py-2 border-b border-asc-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-asc-matte">
                      {status.status}
                    </p>
                    <p className="text-xs text-asc-charcoal">
                      {status._count.status} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-asc-matte">
                      {formatCurrency(status._sum.total || 0)}
                    </p>
                    <div className="w-16 bg-asc-sand-muted rounded-full h-2">
                      <div
                        className="bg-asc-matte h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (status._sum.total || 0) / totalRevenue * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-asc-matte mb-4">
              Top Products
            </h3>
            <div className="space-y-3">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between py-2 border-b border-asc-border last:border-0"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-asc-sand-muted rounded-full flex items-center justify-center text-xs font-medium text-asc-matte">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-asc-matte">
                        Product #{product.productId}
                      </p>
                      <p className="text-xs text-asc-charcoal">
                        {product._sum.quantity} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-asc-matte">
                      {formatCurrency(product._sum.total || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-asc-matte mb-4">
            Sales by Category
          </h3>
          <div className="space-y-3">
            {analytics.salesByCategory.slice(0, 8).map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-asc-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-asc-matte">
                    Category {index + 1}
                  </p>
                  <p className="text-xs text-asc-charcoal">
                    {category._sum.quantity} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-asc-matte">
                    {formatCurrency(category._sum.total || 0)}
                  </p>
                  <div className="w-16 bg-asc-sand-muted rounded-full h-2">
                    <div
                      className="bg-asc-matte h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (category._sum.total || 0) / totalRevenue * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
