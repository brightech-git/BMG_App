import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../Config/baseUrl';

export interface CartItem {
  sno: number;
  itemTagSno: string;
  quantity: number;
  userId: number;
  [key: string]: any;
}

export interface Product {
  SNO: string;
  ImagePath?: string;
  GrandTotal?: string;
  quantity?: number;
  cartSno?: number;
  itemTagSno?: string;
  [key: string]: any;
}

const getAuthData = async (): Promise<{ token: string; phone: string }> => {
  const token = await AsyncStorage.getItem('user_token');
  const phone = await AsyncStorage.getItem('user_contact');

  if (!token) throw new Error('User token not found');
  if (!phone) throw new Error('User contact number not found');

  return { token, phone };
};

export const cartService = {
getItemsByPhone: async (): Promise<CartItem[]> => {
  try {
    const { token, phone } = await getAuthData();

    const res = await fetch(`${API_BASE_URL}/cart/by-phone?phone=${phone}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204) return []; // No content

    const text = await res.text();

    if (!res.ok) throw new Error(text || 'Failed to fetch cart items');

    // ✅ Safely check if response is valid JSON
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      if (text.includes('Your cart is empty')) {
        // console.warn('🛒 Cart is empty.');
        return [];
      }

      console.error('❌ JSON parse error in cart:', err);
      throw new Error('Unexpected response format from cart API');
    }

    // ✅ Handle valid JSON structures
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;

    console.warn('⚠️ Unexpected cart response structure:', parsed);
    return [];
  } catch (error) {
    console.error('❌ cartService.getItemsByPhone:', error);
    return [];
  }
},


  getDetailedCartProducts: async (): Promise<Product[]> => {
    try {
      const { token } = await getAuthData();
      const cartItems = await cartService.getItemsByPhone();

      const products = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const url = `${API_BASE_URL}/product/getSnofilter?sno=${encodeURIComponent(item.itemTagSno)}`;
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            const text = await res.text();
            console.log(`🟡 Raw Response for SNO ${item.itemTagSno}:`, text);

            if (res.status === 204 || !text.trim()) {
              console.warn(`⚠️ Empty response for SNO: ${item.itemTagSno}`);
              return null;
            }

            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch (err) {
              console.error(`❌ JSON parse error for SNO: ${item.itemTagSno}`, err);
              return null;
            }

            const product =
              Array.isArray(parsed?.result) ? parsed.result[0]
              : Array.isArray(parsed) ? parsed[0]
              : parsed?.result ?? parsed;

            if (!product || !product.SNO) {
              console.warn(`⚠️ No product found for SNO: ${item.itemTagSno}`);
              return null;
            }

            return {
              ...product,
              quantity: item.quantity,
              cartSno: item.sno,
              itemTagSno: item.itemTagSno,
              ImagePath: product.ImagePath || 'https://via.placeholder.com/150', // Safe fallback
            };
          } catch (err) {
            console.error(`❌ Failed to fetch product ${item.itemTagSno}:`, err);
            return null;
          }
        })
      );

      return products.filter((p): p is Product => p !== null);
    } catch (error) {
      console.error('❌ cartService.getDetailedCartProducts:', error);
      return [];
    }
  },

  addItem: async (payload: Omit<CartItem, 'sno'>): Promise<void> => {
    try {
      const { token } = await getAuthData();

      const res = await fetch(`${API_BASE_URL}/cart/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorRes = await res.json().catch(() => ({}));
        throw new Error(errorRes.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('❌ cartService.addItem:', error);
      throw error;
    }
  },

  removeItem: async (sno: number): Promise<void> => {
    try {
      const { token } = await getAuthData();

      const res = await fetch(`${API_BASE_URL}/cart/delete/${sno}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorRes = await res.json().catch(() => ({}));
        throw new Error(errorRes.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('❌ cartService.removeItem:', error);
      throw error;
    }
  },

  updateItemQuantity: async (sno: number, quantity: number): Promise<void> => {
    try {
      const { token } = await getAuthData();

      const res = await fetch(`${API_BASE_URL}/cart/update-quantity`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sno, quantity }),
      });

      if (!res.ok) {
        const errorRes = await res.json().catch(() => ({}));
        throw new Error(errorRes.message || 'Failed to update item quantity');
      }
    } catch (error) {
      console.error('❌ cartService.updateItemQuantity:', error);
      throw error;
    }
  },

  isItemInCart: async (itemTagSno: string): Promise<boolean> => {
    try {
      const items = await cartService.getItemsByPhone();
      return items.some((item) => item.itemTagSno === itemTagSno);
    } catch (error) {
      console.error('❌ cartService.isItemInCart:', error);
      return false;
    }
  },
};
