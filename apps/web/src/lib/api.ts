const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrls: string[];
  variants: ProductVariant[];
  inStock: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  price: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  sort?: "newest" | "oldest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category);
    }
    if (filters.gender && filters.gender !== "all") {
      params.append("gender", filters.gender);
    }
    if (filters.size) {
      params.append("size", filters.size);
    }
    if (filters.color) {
      params.append("color", filters.color);
    }
    if (filters.sort) {
      params.append("sort", filters.sort);
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    const query = params.toString();
    const endpoint = `/api/v1/products${query ? `?${query}` : ""}`;
    
    return this.request<ProductsResponse>(endpoint);
  }

  async getProduct(slug: string): Promise<Product> {
    return this.request<Product>(`/api/v1/products/${slug}`);
  }
}

export const apiClient = new ApiClient();
