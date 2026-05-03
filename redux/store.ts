import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/slice';

export const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Singleton store instance — used by StoreProvider and accessible outside React
let _store: AppStore | null = null;

export const getStore = (): AppStore => {
  if (!_store) {
    _store = makeStore();
  }
  return _store;
};
