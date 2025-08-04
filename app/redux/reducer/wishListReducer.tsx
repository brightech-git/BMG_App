import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favoriteService } from '../../Services/FavouriteService';

interface Product {
  SNO: string;
  [key: string]: any;
}

interface WishListState {
  wishList: Product[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: WishListState = {
  wishList: [],
  loading: false,
  error: null,
};

// 🔄 Async Thunks
export const fetchWishList = createAsyncThunk<Product[]>(
  'wishList/fetchWishList',
  async (_, thunkAPI) => {
    try {
      const data = await favoriteService.getFavoriteProducts();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  }
);

export const addProductToWishList = createAsyncThunk<Product, Product>(
  'wishList/addProductToWishList',
  async (product, thunkAPI) => {
    try {
      await favoriteService.addToFavorites(product.SNO);
      return product;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to add to wishlist');
    }
  }
);

export const removeProductFromWishList = createAsyncThunk<string, string>(
  'wishList/removeProductFromWishList',
  async (sno, thunkAPI) => {
    try {
      await favoriteService.removeFromFavorites(sno);
      return sno;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to remove from wishlist');
    }
  }
);

// 🧩 Slice
export const wishListSlice = createSlice({
  name: 'wishList',
  initialState,
  reducers: {
    clearWishList: (state) => {
      state.wishList = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishList.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.wishList = action.payload;
      })
      .addCase(fetchWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addProductToWishList.fulfilled, (state, action: PayloadAction<Product>) => {
        const exists = state.wishList.find((p) => p.SNO === action.payload.SNO);
        if (!exists) {
          state.wishList.push(action.payload);
        }
      })

      // Remove
      .addCase(removeProductFromWishList.fulfilled, (state, action: PayloadAction<string>) => {
        state.wishList = state.wishList.filter((item) => item.SNO !== action.payload);
      });
  },
});

export const { clearWishList } = wishListSlice.actions;

export default wishListSlice.reducer;
