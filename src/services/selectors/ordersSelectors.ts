import { RootState } from '../store';

export const selectUserOrders = (state: RootState) => state.orders.orders;
export const selectUserOrdersLoading = (state: RootState) =>
  state.orders.loading;
export const selectUserOrdersError = (state: RootState) => state.orders.error;
