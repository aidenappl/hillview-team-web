import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from "next-redux-wrapper";
import { User } from '../../types';


interface UserState {
	data: User | null;
	loggedIn: boolean;
}

const initialState: UserState = {
	data: null,
	loggedIn: false
};

const user = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginSuccess(state, action: PayloadAction<User>) {
			state.data = action.payload;
			state.loggedIn = true;
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
		}
	},
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action: any) => {
			return {
				...state,
				...action.payload.user,
			};
		});
	}
});

export const { loginSuccess, logoutSuccess, updateUser } = user.actions;
export const selectUser = (state: any) => state.user.data;

export default user.reducer;