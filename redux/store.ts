import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import userReducer from './user/slice';

const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;

export const store = makeStore;
export const wrapper = createWrapper<AppStore>(makeStore);
