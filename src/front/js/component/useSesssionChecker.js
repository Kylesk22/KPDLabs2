import { useEffect } from "react";
import { apiClient } from "./apiClient";

export function useSessionChecker(logout) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await apiClient("/api/session-check", {}, logout);
      } catch {
        // logout already handled in apiClient
      }
    }, 60000); // every 60s

    return () => clearInterval(interval);
  }, [logout]);
}