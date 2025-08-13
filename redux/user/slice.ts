import { createSlice } from '@reduxjs/toolkit';
import {HYDRATE} from "next-redux-wrapper";
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
		loginSuccess(state: any, action: any) {
			state.data = action.payload;
			state.loggedIn = true;
		},
		updateUser(state: any, action: any) {
			Object.keys(action.payload).forEach((item: any) => {
				state.data[item] = action.payload[item];
			})	
		},
		logoutSuccess(state: any) {
			state.data = null;
			state.loggedIn = false;
		}
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			return {
				...state,
				...action.payload.user,
			};
		},
	}
});

export const { loginSuccess, logoutSuccess, updateUser } = user.actions;
export const selectUser = (state: any) => state.user.data;

export default user.reducer;