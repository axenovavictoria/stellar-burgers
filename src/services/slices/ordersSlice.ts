import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

type TOrdersWsMessage = {
  success: boolean;
  orders: TOrder[];
};

type TOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  orders: [],
  loading: true,
  error: null
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    ordersWsMessage: (state, action: PayloadAction<TOrdersWsMessage>) => {
      state.loading = false;
      state.orders = action.payload.orders;
    },
    ordersWsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { ordersWsMessage, ordersWsError } = ordersSlice.actions;
export default ordersSlice.reducer;
