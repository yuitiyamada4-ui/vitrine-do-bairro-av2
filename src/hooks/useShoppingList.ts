import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { storageService } from '../services/storage';

export const useShoppingList = (businessIdFilter?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const togglePurchased = useCallback(async (id: string) => {
    const item = products.find(p => p.id === id);
    if (!item) return;

    const nextState = !item.isPurchased;
    await storageService.updateProduct(id, { isPurchased: nextState });
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, isPurchased: nextState } : p))
    );
  }, [products]);

  const removeProduct = useCallback(async (id: string) => {
    await storageService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!businessIdFilter) return products;
    return products.filter(p => p.businessId === businessIdFilter);
  }, [products, businessIdFilter]);

  const totalEstimated = useMemo(() => {
    return filteredProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [filteredProducts]);

  const totalPurchased = useMemo(() => {
    return filteredProducts
      .filter(item => item.isPurchased)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [filteredProducts]);

  const totalPending = useMemo(() => {
    return filteredProducts
      .filter(item => !item.isPurchased)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [filteredProducts]);

  return {
    products: filteredProducts,
    allProductsCount: products.length,
    loading,
    refresh: loadProducts,
    togglePurchased,
    removeProduct,
    totalEstimated,
    totalPurchased,
    totalPending,
  };
};
