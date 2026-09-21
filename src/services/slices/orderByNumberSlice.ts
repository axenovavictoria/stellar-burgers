import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

export const fetchOrderByNumber = createAsyncThunk(
  'orderByNumber/fetch',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0];
  }
);

type TOrderByNumberState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
};

const initialState: TOrderByNumberState = {
  order: null,
  loading: false,
  error: null
};

export const orderByNumberSlice = createSlice({
  name: 'orderByNumber',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Заказ не найден';
      });
  }
});

export default orderByNumberSlice.reducer;
