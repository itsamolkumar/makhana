import api from "./api";

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const getProducts = (params?: ProductsParams) => {
  return api.get("/products", { params });
};

export const getProductBySlug = (slug: string) => {
  return api.get(`/products/${slug}`);
};
