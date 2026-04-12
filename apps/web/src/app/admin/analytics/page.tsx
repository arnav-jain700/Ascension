"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ['#2E2E2E', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'];

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  ordersByStatus: any[];
  revenueByDay: any[];
  topProducts: any[];
  customerGrowth: any[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/admin/analytics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const resData = await response.json();
      setData(resData.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
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

  if (!data) return null;

  // Format revenue data
  // Aggregate revenue by date string
  const revenueMap: Record<string, number> = {};
  data.revenueByDay.forEach((item: any) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    revenueMap[date] = (revenueMap[date] || 0) + item.total;
  });
  
  const formattedRevenueData = Object.keys(revenueMap).map(date => ({
    name: date,
    revenue: revenueMap[date]
  }));

  // Format orders by status
  const statusData = data.ordersByStatus.map((item: any) => ({
    name: item.status,
    value: item._count.status
  }));

  // Format customer growth
  const customerMap: Record<string, number> = {};
  data.customerGrowth.forEach((item: any) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    customerMap[date] = (customerMap[date] || 0) + item._count.createdAt;
  });

  const formattedCustomerData = Object.keys(customerMap).map(date => ({
    name: date,
    customers: customerMap[date]
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Analytics Overview</h1>
          <p className="mt-1 text-sm text-asc-charcoal">
            Detailed view of your store's performance.
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="block px-3 py-2 border border-asc-border-strong rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-asc-matte mb-4">Revenue ({period})</h3>
          <div className="h-72">
            {formattedRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E2E2E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E2E2E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2E2E2E" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-asc-charcoal-muted">
                No revenue data available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-asc-matte mb-4">Order Status Distribution</h3>
          <div className="h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-asc-charcoal-muted">
                No orders data available for this period.
              </div>
            )}
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white p-6 shadow rounded-lg lg:col-span-2">
          <h3 className="text-lg font-medium text-asc-matte mb-4">New Customers Registration</h3>
          <div className="h-72">
            {formattedCustomerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCustomerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} />
                  <Bar dataKey="customers" fill="#B0B0B0" radius={[4, 4, 0, 0]} name="New Customers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-asc-charcoal-muted">
                No customer registration data available for this period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
