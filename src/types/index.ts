export interface Business {
  id: string;
  name: string;
  category: string;
  address?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  quantity: number;
  isPurchased: boolean;
  businessId?: string;
  businessName?: string;
}

export type RootStackParamList = {
  Home: undefined;
  ProductList: { businessId?: string; businessName?: string } | undefined;
  ProductForm: { productId?: string; businessId?: string; businessName?: string } | undefined;
  ProductDetail: { productId: string };
};
