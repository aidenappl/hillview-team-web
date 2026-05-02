
import { User } from "../../types";
import { AppDispatch } from "../store";
import { loginSuccess, logoutSuccess } from "./slice";

const UpdateStoreUser = async (update: User, dispatch: AppDispatch) => {
    dispatch(loginSuccess(update));
}

const ClearStoreUser = async (dispatch: AppDispatch) => {
    dispatch(logoutSuccess());
}

export {
    UpdateStoreUser,
    ClearStoreUser
}