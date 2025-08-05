import { API_BASE_URL } from '../Config/baseUrl';

export interface CategoryBanner {
  id: number;
  title: string;
  subtitle: string;
  itemName: string;
  subItemName: string;
  created_at: string;
  image_path: string; // Full URL to the image
}

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

export const categoryService = {
  getCategoryBanners: async (): Promise<CategoryBanner[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/category_banner/list`);

      const text = await response.text();
      let parsed: any;

      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error('❌ JSON parse error in getCategoryBanners:', err);
        throw new Error('Invalid JSON response from server');
      }

      if (!Array.isArray(parsed)) {
        console.warn('⚠️ Unexpected response structure for category banners:', parsed);
        return [];
      }

      // 🔗 Map image paths to full URLs
      const fullData: CategoryBanner[] = parsed.map((item) => ({
        ...item,
        image_path: item.image_path.startsWith('http')
          ? item.image_path
          : `${BASE_IMAGE_URL}${item.image_path}`,
      }));

      return fullData;
    } catch (error) {
      console.error('❌ categoryService.getCategoryBanners:', error);
      return [];
    }
  },
};
