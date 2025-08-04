import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../Services/CartService';

// Thunks
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getItemsByPhone();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart items');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (item: any, { dispatch, rejectWithValue }) => {
    try {
      await cartService.addItem(item);
      dispatch(fetchCartItems());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add item to cart');
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (sno: number, { dispatch, rejectWithValue }) => {
    try {
      await cartService.removeItem(sno);
      dispatch(fetchCartItems());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove item from cart');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async (
    { sno, quantity }: { sno: number; quantity: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await cartService.updateItemQuantity(sno, quantity);
      dispatch(fetchCartItems());
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update quantity');
    }
  }
);

// Slice
export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addItemToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
