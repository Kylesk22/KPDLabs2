import React, { createContext, useState, useCallback } from "react";
import { useSessionChecker } from "../component/useSesssionChecker";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [logoutReason, setLogoutReason] = useState(null);

  const logout = useCallback((reason = "manual") => {
    setUser(null);
    setLogoutReason(reason);
    // You can also clear localStorage or navigate("/login") here if you want
  }, []);

  // Runs the background 60s check
  useSessionChecker(logout);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, logoutReason }}>
      {children}
    </AuthContext.Provider>
  );
}