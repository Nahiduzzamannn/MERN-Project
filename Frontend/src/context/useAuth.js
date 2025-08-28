import { useContext } from "react";
import { AuthContext } from "./AuthContextBase.js";

export const useAuth = () => useContext(AuthContext);
