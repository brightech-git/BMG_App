import { API_BASE_URL } from '../Config/baseUrl';

export interface ProductItem {
  MaterialFinish: string;
  Description: string;
  TAGNO: string;
  Occasion: string;
  RATE: string;
  GSTAmount: string;
  TAGKEY: string;
  Gender: string;
  SIZEID: number;
  Best_Design: boolean;
  SNO: string;
  CollectionType: string;
  ImagePaths: string[]; // Parsed image URLs
  NewArrival: boolean;
  GrossAmount: string;
  Featured_Products: boolean;
  SIZENAME: string | null;
  Rate: string;
  StoneType: string | null;
  SUBITEMNAME: string;
  CATNAME: string;
  NETWT: string;
  GSTPer: string;
  Top_Trending: boolean;
  GrandTotal: string;
  ColorAccents: string;
  ITEMID: string;
  ITEMNAME: string;
}

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

export const productService = {
  getFilteredProducts: async (page: number = 0, pageSize: number = 10): Promise<ProductItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/items/filter?page=${page}&pageSize=${pageSize}`);
      const text = await response.text();

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error('❌ JSON parse error in getFilteredProducts:', err);
        throw new Error('Invalid JSON response from server');
      }

      const items = parsed?.data;
      if (!Array.isArray(items)) {
        console.warn('⚠️ Unexpected product list format:', parsed);
        return [];
      }

      const products: ProductItem[] = items.map((item) => {
        let imagePaths: string[] = [];

        try {
          const rawImageString = item.ImagePath;
          const parsedPaths = JSON.parse(rawImageString);
          if (Array.isArray(parsedPaths)) {
            imagePaths = parsedPaths.map((path: string) =>
              path.startsWith('http') ? path : `${BASE_IMAGE_URL}${path}`
            );
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse ImagePath:', item.ImagePath);
          imagePaths = [];
        }

        return {
          ...item,
          ImagePaths: imagePaths,
        };
      });

      return products;
    } catch (error) {
      console.error('❌ productService.getFilteredProducts:', error);
      return [];
    }
  },
};
