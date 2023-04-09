
import { User } from "../../models/user.model";
import { loginSuccess, logoutSuccess, updateUser } from "./slice";

const UpdateStoreUser = async (update: User, dispatch: any) => {
    try { 
       await dispatch(loginSuccess(update as any));
    } catch(error) {
        throw error
    }
}

const ClearStoreUser = async (dispatch: any) => {
    try { 
       await dispatch(logoutSuccess());
    } catch(error) {
        throw error
    }
}

export {
    UpdateStoreUser,
    ClearStoreUser
}