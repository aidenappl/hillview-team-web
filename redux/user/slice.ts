import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
	data: User | null;
	loggedIn: boolean;
	loading: boolean;
}

const initialState: UserState = {
	data: null,
	loggedIn: false,
	loading: true,
};

const user = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginSuccess(state, action: PayloadAction<User>) {
			state.data = action.payload;
			state.loggedIn = true;
			state.loading = false;
		},
		updateUser(state, action: PayloadAction<Partial<User>>) {
			if (state.data) {
				Object.keys(action.payload).forEach((item) => {
					(state.data as any)[item] = (action.payload as any)[item];
				});
			}
		},
		logoutSuccess(state) {
			state.data = null;
			state.loggedIn = false;
			state.loading = false;
		},
		setAuthLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload;
		},
	},
});

export const { loginSuccess, logoutSuccess, updateUser, setAuthLoading } = user.actions;
export const selectUser = (state: { user: UserState }) => state.user.data;
export const selectLoggedIn = (state: { user: UserState }) => state.user.loggedIn;
export const selectAuthLoading = (state: { user: UserState }) => state.user.loading;

export default user.reducer;
