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
      // No redirect here — LogoutNotice will show the modal
  }, []);

  // Poll for token only if a user is logged in
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!sessionStorage.getItem("id")) return;
            try {
                const res = await fetch("/api/session-check", { credentials: "include" });
                if (res.status === 401) {
                    logout("expired");
                }
            } catch (err) {
                console.log("Session check error:", err);
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [logout]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, logoutReason, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}



