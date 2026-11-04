import { Business } from '../types';
import { storageService } from './storage';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com/users';

const FALLBACK_BUSINESSES: Business[] = [
  { id: '1', name: 'Padaria do Seu Zé', category: 'Padaria & Confeitaria', address: 'Rua das Flores, 120', phone: '(11) 98765-4321' },
  { id: '2', name: 'Mercadinho Esperança', category: 'Supermercado & Mercearia', address: 'Av. Principal, 450', phone: '(11) 97654-3210' },
  { id: '3', name: 'Hortifruti da Terra', category: 'Frutas e Verduras', address: 'Rua das Palmeiras, 85', phone: '(11) 96543-2109' },
  { id: '4', name: 'Açougue Bom Corte', category: 'Carnes e Aves', address: 'Rua do Comércio, 310', phone: '(11) 95432-1098' },
  { id: '5', name: 'Farmácia Saúde do Bairro', category: 'Farmácia & Cuidados', address: 'Av. Central, 900', phone: '(11) 94321-0987' },
];

export const apiService = {
  async getBusinesses(): Promise<Business[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(API_BASE_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const mapped: Business[] = data.map((item: any, index: number) => {
        const categories = ['Padaria & Confeitaria', 'Supermercado', 'Hortifruti', 'Farmácia', 'Açougue'];
        return {
          id: item.id.toString(),
          name: item.name,
          category: categories[index % categories.length],
          address: `${item.address?.street || 'Rua Principal'}, ${item.address?.suite || '100'}`,
          phone: item.phone || '(11) 99999-0000',
        };
      });

      // Salva no cache local (offline-first)
      await storageService.cacheBusinesses(mapped);
      return mapped;
    } catch {
      // Estratégia offline-first: busca no cache local ou fallback pré-definido
      const cached = await storageService.getCachedBusinesses();
      if (cached && cached.length > 0) {
        return cached;
      }
      return FALLBACK_BUSINESSES;
    }
  },

  async getBusinessById(id: string): Promise<Business | null> {
    const businesses = await apiService.getBusinesses();
    return businesses.find(b => b.id === id) || null;
  },
};
