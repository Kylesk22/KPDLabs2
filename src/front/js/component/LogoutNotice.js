import { useContext } from "react";
import { AuthContext } from "../component/AuthProvider";

export function LogoutNotice() {
    const { logoutReason, setLogoutReason } = useContext(AuthContext);

    if (!logoutReason) return null;

    let message = "";
    if (logoutReason === "expired") {
        message = "Your session has expired due to inactivity.";
    } else if (logoutReason === "invalid") {
        message = "Your session is invalid. Please log in again.";
    } else if (logoutReason === "manual") {
        message = "You have been logged out successfully.";
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                backgroundColor: "#222429", border: "3px solid #ffaa17",
                padding: "48px 40px", maxWidth: "420px", width: "90%",
                textAlign: "center", borderRadius: "4px"
            }}>
                <i className="fa-solid fa-clock" style={{ fontSize: "40px", color: "#ffaa17", marginBottom: "20px", display: "block" }}></i>
                <h3 style={{ color: "white", fontFamily: "'Georgia', serif", fontWeight: "400", marginBottom: "16px" }}>
                    Session Expired
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Arial', sans-serif", fontSize: "14px", lineHeight: "1.7", marginBottom: "32px" }}>
                    {message}
                </p>
                <a href="/login" style={{
                    display: "inline-block", padding: "14px 48px",
                    backgroundColor: "#ffaa17", color: "#222429",
                    textDecoration: "none", fontSize: "12px",
                    letterSpacing: "2px", textTransform: "uppercase",
                    fontFamily: "'Arial', sans-serif", fontWeight: "700"
                }}>Log Back In</a>
            </div>
        </div>
    );
}