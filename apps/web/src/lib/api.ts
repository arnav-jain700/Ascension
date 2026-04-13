const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  comparePrice?: number | null;
  imageUrls: string[];
  variants: ProductVariant[];
  inStock: boolean;
  color?: string;
  siblingColors?: { id: string; slug: string; sku: string; color: string; images: Record<string, unknown>[] }[];
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
  search?: string;
  gender?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

class ApiClient {
  public async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = typeof window !== "undefined" ? localStorage.getItem("ascension-auth-token") : null;
    
    const fetchPromise = fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });

    const timeoutPromise = new Promise<Response>((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out. Please try again.")), 10000)
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    return jsonData?.success && jsonData?.data !== undefined ? jsonData.data : jsonData;
  }

  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category);
    }
    if (filters.search) {
      params.append("search", filters.search);
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
    if (filters.minPrice) {
      params.append("minPrice", filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append("maxPrice", filters.maxPrice.toString());
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

  async getRecommendations(slug: string): Promise<Product[]> {
    return this.request<Product[]>(`/api/v1/products/${slug}/recommendations`);
  }

  async getMe(): Promise<any> {
    return this.request<any>("/api/v1/auth/profile");
  }
}

export const apiClient = new ApiClient();
