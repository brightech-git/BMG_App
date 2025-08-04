import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../Config/baseUrl';

interface Product {
  SNO: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const getToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('user_token');
  if (!token) throw new Error('User token not found');
  return token;
};

export const favoriteService = {
  /**
   * 1. Get list of favorite SNOs
   */
  getFavorites: async (): Promise<string[]> => {
    try {
      const token = await getToken();

      const response = await fetch(`${API_BASE_URL}/favorites/list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<string[]> = await response.json();

      if (!response.ok || !result.data) {
        throw new Error(result.message || 'Failed to fetch favorites');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error in getFavorites:', error);
      throw error;
    }
  },

  /**
   * 2. Get detailed product info for all favorites
   */
  getFavoriteProducts: async (): Promise<Product[]> => {
    try {
      const snos = await favoriteService.getFavorites();
      if (!snos.length) return [];

      const token = await getToken();

const productPromises = snos.map(async (sno) => {
  try {
    const url = `${API_BASE_URL}/product/getSnofilter?sno=${encodeURIComponent(sno)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`🔍 Fetching SNO ${sno} - Status: ${res.status}`);

    if (res.status === 204) {
      console.warn(`⚠️ No content for SNO: ${sno}`);
      return null;
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error(`❌ Failed to parse JSON for SNO ${sno}. Raw response:`, text);
      return null;
    }

    if (!res.ok || data?.error) {
      console.warn(`⚠️ Product not found or error for SNO: ${sno}`);
      return null;
    }

    if (Array.isArray(data)) {
      return data[0] || null;
    } else if (data && data.SNO) {
      return data;
    }

    return null;
  } catch (err) {
    console.error(`❌ Error fetching product for SNO ${sno}:`, err);
    return null;
  }
});


      const results = await Promise.all(productPromises);
      return results.filter((p): p is Product => p !== null);
    } catch (error) {
      console.error('❌ Error in getFavoriteProducts:', error);
      return [];
    }
  },

  /**
   * 3. Add SNO to favorites
   */
  addToFavorites: async (itemSno: string): Promise<void> => {
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/favorites/add?itemSno=${encodeURIComponent(itemSno)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('❌ Error in addToFavorites:', error);
      throw error;
    }
  },

  /**
   * 4. Remove SNO from favorites
   */
  removeFromFavorites: async (itemSno: string): Promise<void> => {
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/favorites/remove/${encodeURIComponent(itemSno)}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('❌ Error in removeFromFavorites:', error);
      throw error;
    }
  },
};
