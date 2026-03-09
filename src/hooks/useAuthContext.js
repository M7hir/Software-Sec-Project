import { useSelector } from "react-redux"

export const useAuthContext = () => {
    const User = useSelector((state) => state.auth);
    return User ;
}