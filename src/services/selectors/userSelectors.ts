import { RootState } from '../store';

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectIsAuthenticated = (state: RootState) => !!state.user.user;
export const selectLoginUserRequest = (state: RootState) =>
  state.user.loginUserRequest;
export const selectLoginError = (state: RootState) => state.user.error;
export const selectUpdateUserError = (state: RootState) => state.user.error;
