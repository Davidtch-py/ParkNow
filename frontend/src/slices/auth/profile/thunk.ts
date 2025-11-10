import { profileFailed, profileSuccess } from "./reducer"
import { RootState } from "slices";
import { ThunkAction } from "redux-thunk";
import { Action, Dispatch } from "redux";

// Mock profile function - replace with real API call
const postFakeProfile = async (data: any) => {
    return Promise.resolve(data);
};

interface User {
    username: string;
    idx: number;
}

export const editProfile = (user: User
): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch: Dispatch) => {
    try {
        let response: any;
        if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
            response = await postFakeProfile(user)
        }
        // Firebase auth removed - implement your own profile update here

        if (response) {
            dispatch(profileSuccess(response))
        }

    } catch (error) {
        dispatch(profileFailed(error))
    }
}