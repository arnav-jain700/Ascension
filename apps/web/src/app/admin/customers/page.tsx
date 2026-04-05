"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/v1/admin/customers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data.data.customers);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/admin/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer status");
      }

      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? { ...customer, isActive: !currentStatus }
          : customer
      ));
    } catch (err: any) {
      alert(err.message || "Failed to update customer status");
    }
  };

  if (loading && customers.length === 0) {
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
        <h1 className="text-2xl font-bold text-asc-matte">Customers</h1>
        <p className="mt-1 text-sm text-asc-charcoal">
          Manage your customer database
        </p>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-asc-charcoal-muted" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-asc-border-strong rounded-md leading-5 bg-white placeholder-asc-charcoal-muted focus:outline-none focus:placeholder-asc-charcoal-muted focus:ring-1 focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
            />
          </div>
          <div></div> {/* Empty div for grid layout */}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-asc-border">
            <thead className="bg-asc-sand-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-asc-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-asc-sand-muted">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-asc-matte">
                        {customer.name}
                      </div>
                      <div className="text-sm text-asc-charcoal">
                        Joined {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-asc-charcoal">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center text-sm text-asc-charcoal">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                    {customer._count.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                    {customer.lastLoginAt
                      ? new Date(customer.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/admin/customers/${customer.id}`}
                        className="text-asc-matte hover:text-asc-charcoal"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                        className={`${
                          customer.isActive
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        title={customer.isActive ? "Deactivate" : "Activate"}
                      >
                        {customer.isActive ? (
                          <XMarkIcon className="h-4 w-4" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-asc-charcoal">No customers found</p>
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
