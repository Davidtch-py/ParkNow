import { loginError, loginSuccess, logoutSuccess } from "./reducer";
import { ThunkAction } from "redux-thunk";
import { Action, Dispatch } from "redux";
import { RootState } from "slices";

// Mock login function - replace with real API call
const postFakeLogin = async (data: any) => {
    return Promise.resolve({ user: data, token: 'mock-token' });
};

interface User {
    email: string;
    password: string;
}

export const loginUser = (
    user: User,
    history: any
): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch: Dispatch) => {
    try {
        let response: any;
        if (process.env.REACT_APP_DEFAULTAUTH === "fake") {

            response = await postFakeLogin({
                email: user.email,
                password: user.password,
            });

            localStorage.setItem("authUser", JSON.stringify(response));

        }
        // Firebase auth removed - add your own auth implementation here

        if (response) {
            dispatch(loginSuccess(response));
            history("/dashboard");
        }
    } catch (error) {

        dispatch(loginError(error));
    }
};

export const logoutUser = () => async (dispatch: Dispatch) => {
    try {
        localStorage.removeItem("authUser");
        dispatch(logoutSuccess(true));
    } catch (error) {
        dispatch(loginError(error));
    }
}


export const socialLogin = (type: any, history: any) => async (dispatch: any) => {
    try {
        // Social login removed - implement your own social auth here
        dispatch(loginError("Social login not implemented"));
    } catch (error) {
        dispatch(loginError(error));
    }
}