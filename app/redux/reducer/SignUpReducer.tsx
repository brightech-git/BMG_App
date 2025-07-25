
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, SignupPayload } from './types.d';
import { registerUser } from '../../Services/SignUpService';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: SignupPayload, thunkAPI) => {
    try {
      const response = await registerUser(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
