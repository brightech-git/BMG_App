// src/redux/reducer/login/loginSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LoginPayload, LoginState } from './types.d';
import { loginUser } from '../../Services/LoginService';

const initialState: LoginState = {
  user: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Async Thunk
export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginPayload, thunkAPI) => {
    try {
      const response = await loginUser(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Login failed');
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    resetLoginState: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      });
  },
});

export const { resetLoginState } = loginSlice.actions;
export default loginSlice.reducer;
