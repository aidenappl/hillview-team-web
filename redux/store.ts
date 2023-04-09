import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import userReducer from './user/slice';
import { nextReduxCookieMiddleware, wrapMakeStore } from 'next-redux-cookie-wrapper';

const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
    },
});

const wrappedMakeStore = wrapMakeStore(makeStore);

export type AppStore = ReturnType<typeof makeStore>;

export const store = wrappedMakeStore;
export const wrapper = createWrapper<AppStore>(wrappedMakeStore);
