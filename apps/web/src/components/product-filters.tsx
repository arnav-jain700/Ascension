"use client";

import { useState } from "react";

interface ProductFiltersProps {
  filters: {
    category: string;
    size: string;
    color: string;
    sort: string;
  };
  onFiltersChange: (filters: any) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "t-shirts", label: "T-Shirts" },
  { value: "joggers", label: "Joggers" },
];

const sizes = [
  { value: "", label: "All Sizes" },
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
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

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-asc-border rounded-md text-asc-charcoal hover:border-asc-accent hover:text-asc-accent transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filters */}
      <div className={`${isMobileFilterOpen ? "block" : "hidden"} lg:block bg-asc-canvas border border-asc-border rounded-lg p-6 mb-8`}>
        <h3 className="text-lg font-semibold text-asc-matte mb-4">Filters</h3>
        
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
    </>
  );
}
