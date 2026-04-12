"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [genderTag, setGenderTag] = useState("unisex");
  const [sizes, setSizes] = useState("");
  const [inventory, setInventory] = useState("10");


  // Image states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      // Generate previews
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Authentication required");

      let uploadedImageUrls: any[] = [];

      // 1. Upload Images if any exist
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        const uploadRes = await fetch("/api/v1/upload/product-images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Failed to upload images");
        
        uploadedImageUrls = uploadData.data; // array of { url: string, ... }
      }

      // 2. Create Product
      const productPayload = {
        name,
        sku,
        color,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : undefined,
        description,
        status,
        images: uploadedImageUrls,
        tags: [genderTag],
        sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
        inventory: Number(inventory),
      };

      const productRes = await fetch("/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.message || "Failed to create product");

      // Redirect to products list on success
      alert("Product has been added successfully!");
      router.push("/admin/products");

    } catch (err: any) {
      setError(err.message || "Something went wrong saving the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-full hover:bg-asc-sand-muted text-asc-charcoal transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-asc-matte">Add New Product</h1>
          <p className="mt-1 text-sm text-asc-charcoal">
            Create a new apparel item for your store
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-asc-border">
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 pt-6">
          <div className="sm:col-span-4">
            <label htmlFor="name" className="block text-sm font-medium text-asc-matte">
              Product Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="e.g. Classic Workout Tee"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sku" className="block text-sm font-medium text-asc-matte">
              SKU (Stock Keeping Unit) *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="sku"
                id="sku"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="ASC-TEE-001"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="color" className="block text-sm font-medium text-asc-matte">
              Color Name *
            </label>
            <div className="mt-1">
              <select
                id="color"
                name="color"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong bg-white rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm capitalize"
              >
                <option value="">Select a color</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="gray">Gray</option>
                <option value="navy">Navy</option>
                <option value="olive">Olive</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="price" className="block text-sm font-medium text-asc-matte">
              Price (₹) *
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="1999"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="comparePrice" className="block text-sm font-medium text-asc-matte">
              Compare at price (Discount mapping)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="comparePrice"
                id="comparePrice"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="2499 (Optional cross-out price)"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-asc-matte">
              Description *
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="Detailed description of the product material, fit, and care..."
              />
            </div>
          </div>


          <div className="sm:col-span-3">
            <label htmlFor="genderTag" className="block text-sm font-medium text-asc-matte">
              Demographic / Gender
            </label>
            <div className="mt-1">
              <select
                id="genderTag"
                name="genderTag"
                value={genderTag}
                onChange={(e) => setGenderTag(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong bg-white rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
              >
                <option value="unisex">Unisex (Both Men & Women)</option>
                <option value="men">Men's Only</option>
                <option value="women">Women's Only</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sizes" className="block text-sm font-medium text-asc-matte">
              Available Sizes (comma separated)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="sizes"
                id="sizes"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="e.g. S, M, L, XL"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="inventory" className="block text-sm font-medium text-asc-matte">
              Initial Stock Level (Per Size) *
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="inventory"
                id="inventory"
                required
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
                placeholder="10"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="status" className="block text-sm font-medium text-asc-matte">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-asc-border-strong bg-white rounded-md shadow-sm focus:ring-asc-matte focus:border-asc-matte sm:text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg leading-6 font-medium text-asc-matte">Product Images</h3>
            <p className="mt-1 text-sm text-asc-charcoal">
              Upload high-quality images. The first image will be used as the thumbnail.
            </p>
          </div>

          <div className="mt-4">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-asc-border-strong border-dashed rounded-md hover:bg-asc-sand-muted cursor-pointer transition-colors relative">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-asc-charcoal-muted" aria-hidden="true" />
                <div className="flex text-sm text-asc-charcoal">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-transparent rounded-md font-medium text-asc-matte hover:text-asc-accent focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/jpeg, image/png, image/webp"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-asc-charcoal-muted">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-asc-border bg-white p-1">
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    className="h-24 w-full object-cover rounded shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform scale-90 hover:scale-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-asc-matte text-white text-[10px] rounded font-medium shadow-sm">
                      Main Thumbnail
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-asc-border-strong rounded-md shadow-sm text-sm font-medium text-asc-charcoal hover:bg-asc-sand-muted focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-asc-matte hover:bg-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>

    </div>
  );
}
