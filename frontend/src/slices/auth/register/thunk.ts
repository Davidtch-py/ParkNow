import { ThunkAction } from "redux-thunk";
import { RootState } from "slices";
import { Action, Dispatch } from "redux";
import { registerFailed, registerSuccess, resetRegister } from "./reducer";

// Mock register function - replace with real API call
const postFakeRegister = async (data: any) => {
    return Promise.resolve({ user: data, token: 'mock-token' });
};

interface User {
    email: string;
    username: string;
    password: string;
}

export const registerUser = (user: User
): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch: Dispatch) => {
    try {
        let response: any;
        if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
            response = await postFakeRegister(user);
        }
        // Firebase auth removed - implement your own registration here
        
        if (response) {
            dispatch(registerSuccess(response));
        }
    } catch (error) {
        dispatch(registerFailed(error));
    }
};

export const resetRegisterFlag = () => {
    try {
        const response = resetRegister(false);
        return response;
    } catch (error) {
        return error;
    }
};