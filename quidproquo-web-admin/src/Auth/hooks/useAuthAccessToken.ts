import { useContext } from "react";
import { authContext } from "../authContext";

export const useAuthAccessToken = () => {
    const authState = useContext(authContext);

    return authState.authenticationInfo?.accessToken;
}
