import { useContext } from "react";
import { AuthContext } from "../component/AuthProvider";

export function LogoutNotice() {
  const { logoutReason } = useContext(AuthContext);

  if (!logoutReason) return null;

  let message = "";
  if (logoutReason === "expired") {
    message = "You have been logged out due to inactivity.";
  } else if (logoutReason === "invalid") {
    message = "Your session is invalid. Please log in again.";
  } else if (logoutReason === "manual") {
    message = "You have logged out successfully.";
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}
