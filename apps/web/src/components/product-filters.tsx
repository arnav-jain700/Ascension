"use client";

import { useState } from "react";

interface ProductFiltersProps {
  filters: {
    category: string;
    size: string;
    color: string;
    sort: string;
    gender?: string;
    priceRange?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFiltersChange: (filters: any) => void;
}

const genders = [
  { value: "all", label: "All Genders" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];



const categories = [
  { value: "all", label: "All Categories" },
  { value: "t-shirts", label: "T-Shirts" },
  { value: "joggers", label: "Joggers" },
];

const sizes = [
  { value: "", label: "All Sizes" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

const colors = [
  { value: "", label: "All Colors" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "gray", label: "Gray" },
  { value: "navy", label: "Navy" },
  { value: "olive", label: "Olive" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ProductFilters({ filters, onFiltersChange, hideGender }: ProductFiltersProps & { hideGender?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    let update: any = { [key]: value };
    if (key === "priceRange") {
      // value is a string like "0-1000"
      const [minStr, maxStr] = value.split("-");
      update.minPrice = minStr ? Number(minStr) : undefined;
      update.maxPrice = maxStr ? Number(maxStr) : undefined;
    }
    
    onFiltersChange({
      ...filters,
      ...update,
    });
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
            isOpen ? "border-asc-matte text-asc-matte bg-asc-sand-muted" : "border-asc-border text-asc-charcoal hover:border-asc-accent hover:text-asc-accent"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          {isOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters */}
      {isOpen && (
        <div className="bg-asc-canvas border border-asc-border rounded-lg p-6 mb-8 slide-down animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-asc-matte">Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-asc-charcoal hover:text-asc-matte">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-asc-charcoal mb-2">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-asc-border rounded-md bg-asc-canvas text-asc-matte focus:border-asc-accent focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            {!hideGender && (
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-asc-charcoal mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={filters.gender || "all"}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-asc-border rounded-md bg-asc-canvas text-asc-matte focus:border-asc-accent focus:outline-none"
                >
                  {genders.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-asc-charcoal mb-2">
                Size
              </label>
              <select
                id="size"
                value={filters.size}
                onChange={(e) => handleFilterChange("size", e.target.value)}
                className="w-full px-3 py-2 border border-asc-border rounded-md bg-asc-canvas text-asc-matte focus:border-asc-accent focus:outline-none"
              >
                {sizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="flex flex-col">
              <label htmlFor="priceRange" className="block text-sm font-medium text-asc-charcoal mb-2">
                Max Price: ₹{filters.maxPrice || 1000}
              </label>
              <input 
                type="range" 
                id="priceRange" 
                min="0" 
                max="1000" 
                step="50" 
                value={filters.maxPrice || 1000}
                onChange={(e) => handleFilterChange("priceRange", `0-${e.target.value}`)}
                className="w-full accent-asc-matte"
              />
              <div className="flex justify-between text-xs text-asc-charcoal mt-1">
                <span>₹0</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-asc-charcoal mb-2">
                Color
              </label>
              <select
                id="color"
                value={filters.color}
                onChange={(e) => handleFilterChange("color", e.target.value)}
                className="w-full px-3 py-2 border border-asc-border rounded-md bg-asc-canvas text-asc-matte focus:border-asc-accent focus:outline-none"
              >
                {colors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-asc-charcoal mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full px-3 py-2 border border-asc-border rounded-md bg-asc-canvas text-asc-matte focus:border-asc-accent focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
