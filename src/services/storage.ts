import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Business } from '../types';

const PRODUCTS_KEY = '@vitrine:products';
const BUSINESSES_KEY = '@vitrine:businesses';

export const storageService = {
  async getProducts(): Promise<Product[]> {
    try {
      const json = await AsyncStorage.getItem(PRODUCTS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveProducts(products: Product[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // Ignora silenciosamente ou trata em camadas superiores
    }
  },

  async addProduct(product: Product): Promise<void> {
    const products = await storageService.getProducts();
    products.push(product);
    await storageService.saveProducts(products);
  },

  async updateProduct(id: string, updatedProduct: Partial<Product>): Promise<void> {
    const products = await storageService.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct };
      await storageService.saveProducts(products);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await storageService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await storageService.saveProducts(filtered);
  },

  async getCachedBusinesses(): Promise<Business[]> {
    try {
      const json = await AsyncStorage.getItem(BUSINESSES_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async cacheBusinesses(businesses: Business[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BUSINESSES_KEY, JSON.stringify(businesses));
    } catch {
      // Falha no cache não interrompe o fluxo
    }
  },
};
