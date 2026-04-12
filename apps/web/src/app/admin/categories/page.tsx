"use client";

import { useState, useEffect } from "react";
import { TagIcon, ExclamationTriangleIcon, CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/products/categories/list`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setError("An unexpected error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setError("");
    setSuccess("");
    setCreatingCategory(true);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/products/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Category "${newCategoryName}" created successfully!`);
        setNewCategoryName("");
        // Quietly refresh the categories table
        await fetchCategories(false);
      } else {
        // Handle specific server errors (e.g. Prisma's P2002 Unique Constraint violation)
        if (data.error === "PrismaClientKnownRequestError" || data.message?.includes("already exists")) {
          setError(`A category named "${newCategoryName}" already exists.`);
        } else {
          setError(data.message || "Failed to create category");
        }
      }
    } catch (err) {
      setError("Network or server error encountered while creating category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? This will detach it from any existing products.`)) {
      return;
    }
    
    setDeletingId(id);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/v1/products/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Category "${name}" deleted successfully!`);
        await fetchCategories(false);
      } else {
        setError(data.message || "Failed to delete category");
      }
    } catch (err) {
      setError("Network error encountered while deleting category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-asc-matte">Category Management</h1>
      </div>

      {/* Bulk Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Creation Engine */}
      <div className="bg-white shadow rounded-lg p-6 border border-asc-border">
        <h2 className="text-lg font-semibold text-asc-matte mb-4">Add a New Category</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label htmlFor="name" className="block text-sm font-medium text-asc-charcoal mb-1">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
              placeholder="e.g. Graphic Tees, Winter Wear"
            />
          </div>
          <button
            type="submit"
            disabled={creatingCategory || !newCategoryName.trim()}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-asc-matte hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingCategory ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>

      {/* Categories Table Dashboard */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-asc-border">
        <div className="px-6 py-4 border-b border-asc-border bg-asc-sand-muted flex items-center">
             <TagIcon className="h-5 w-5 mr-2 text-asc-accent" />
             <h2 className="text-lg font-semibold text-asc-matte">Active Categories Core</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-asc-matte mb-4"></div>
            <p className="text-sm text-asc-charcoal-muted">Hydrating structure data...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-asc-charcoal">
            No categories have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-asc-border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                    Slug ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                    Connected Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-asc-charcoal uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-asc-border flex-col">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-asc-sand-muted transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-asc-matte">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal font-mono">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-asc-charcoal">
                      {cat._count?.products || 0} product(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                         {cat.isActive ? "Active" : "Archived"}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 inline-flex items-center"
                        title="Delete category"
                      >
                        {deletingId === cat.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-1"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5 hover:scale-110 transition-transform" />
                        )}
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
