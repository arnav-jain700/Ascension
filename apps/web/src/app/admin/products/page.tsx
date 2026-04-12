"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  status: string;

  inventory?: {
    quantity: number;
  };
  images: Array<{
    url: string;
  }>;
  createdAt: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, status, page]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/v1/admin/products?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data.products);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Backend server not responding. Please start the backend server.");
      } else {
        setError(err.message || "Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/v1/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asc-matte"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Products</h1>
          <p className="mt-1 text-sm text-asc-charcoal">
            Manage your product catalog
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-asc-matte hover:bg-asc-charcoal transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </a>
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
              placeholder="Search products..."
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
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          <div></div> {/* Empty div for grid layout */}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">{error}</div>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-asc-border">
            <thead className="bg-asc-sand-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Product
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                  Stock
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-asc-sand-muted">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.images && product.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.images[0].url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-asc-sand-muted flex items-center justify-center">
                            <span className="text-xs text-asc-charcoal-muted">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-asc-matte">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal border-l border-r border-transparent">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                    ₹{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.comparePrice && product.comparePrice > product.price ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </span>
                    ) : (
                      <span className="text-asc-charcoal-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                    {product.inventory?.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : product.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : product.status === "OUT_OF_STOCK"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-asc-matte hover:text-asc-charcoal"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <a
                        href={`/admin/products/${product.slug}/edit`}
                        className="text-asc-matte hover:text-asc-charcoal"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-asc-charcoal">No products found</p>
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
