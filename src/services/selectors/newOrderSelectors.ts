import { RootState } from '../store';

export const selectNewOrderRequest = (state: RootState) =>
  state.newOrder.orderRequest;
export const selectNewOrderModalData = (state: RootState) =>
  state.newOrder.orderModalData;
export const selectNewOrderError = (state: RootState) => state.newOrder.error;
