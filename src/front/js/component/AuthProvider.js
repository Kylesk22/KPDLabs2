import React, { createContext, useState, useCallback, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useSessionChecker } from "../component/useSesssionChecker";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [logoutReason, setLogoutReason] = useState(null);
  
  const [loggedIn, setLoggedIn] = useState(false); // 👈 add back your old prop

  const logout = useCallback((reason = "manual") => {
    setUser(null);
    sessionStorage.clear();
    
   
    setLoggedIn(false); // 👈 make sure your UI reacts
    setLogoutReason(reason);

    console.log("Logging out due to:", reason);

    // Optional: force redirect to home
    window.location.href = "/";
  }, []);

  // ----- Client-side JWT expiration check -----
  useEffect(() => {
    const interval = setInterval(() => {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token_cookie="));
      if (!cookie) return;

      const token = cookie.split("=")[1];
      try {
        const decoded = jwtDecode(token);
        if (Date.now() > decoded.exp * 1000) {
          logout("expired");
        }
      } catch (err) {
        console.error("Failed to decode JWT", err);
        logout("invalid");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [logout]);

  // ----- Server-side session check (every 60s) -----
  useSessionChecker(logout);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loggedIn, setLoggedIn, logout, logoutReason }}
    >
      {children}
    </AuthContext.Provider>
  );
}

