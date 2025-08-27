import { useContext } from "react";
import { AuthContext } from "../store/AuthProvider";

export function LogoutNotice() {
  const { logoutReason } = useContext(AuthContext);

  if (logoutReason === "expired") {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
        You have been logged out due to inactivity.
      </div>
    );
  }

  return null;
}