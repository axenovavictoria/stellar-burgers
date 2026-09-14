import { RootState } from '../store';

export const selectOrderByNumber = (state: RootState) =>
  state.orderByNumber.order;
