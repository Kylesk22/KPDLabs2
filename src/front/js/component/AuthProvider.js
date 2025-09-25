import React, { createContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext();

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) return cookieValue;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [logoutReason, setLogoutReason] = useState(null);

  const logout = useCallback((reason = "manual") => {
    setUser(null);
    setLogoutReason(reason);
    sessionStorage.clear();
    localStorage.clear();
    console.log("Logging out due to:", reason);

    if (reason === "expired") window.location.href = "/";
  }, []);

  // Poll for token only if a user is logged in
  useEffect(() => {
    if (!user) return; // skip polling if no user

    const interval = setInterval(() => {
      if (!getCookie("access_token_cookie") && logoutReason !== "expired") {
        logout("expired");
      }
    }, 10000); // check every 10s

    return () => clearInterval(interval);
  }, [user, logout, logoutReason]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, logoutReason, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}



