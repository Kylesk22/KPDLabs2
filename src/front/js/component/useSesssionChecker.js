import { useEffect } from "react";
import { apiClient } from "./apiClient";

export function useSessionChecker(logout) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await apiClient("/api/session-check", { credentials: "include" });
        
        // Optional: you can check explicitly for a message, just in case
        const data = await res.json();
        if (!data.user) {
          logout("expired");
        }

      } catch (err) {
        // If apiClient threw due to 401, logout already handled
        // You could log it for debugging:
        console.log("Session checker detected expired or missing token");
      }
    }, 60000); // every 60s

    return () => clearInterval(interval);
  }, [logout]);
}
