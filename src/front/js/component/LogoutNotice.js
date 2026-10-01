import React, { useContext, useState } from "react";
import { AuthContext, apiBase } from "./AuthProvider";

export function LogoutNotice() {
  const { logoutReason, warning, check, stayActive, identity } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!logoutReason && !warning) return null;
  const reauthenticate = async event => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (identity && email.trim().toLowerCase() !== identity.toLowerCase()) {
        throw new Error("Sign in with the account that opened this case.");
      }
      const endpoint = window.location.pathname.startsWith("/admin/") ? "admin-login" : "login";
      const response = await fetch(`${apiBase}/${endpoint}`, {
        method: "POST", credentials: "include", signal: AbortSignal.timeout(10000), headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) throw new Error("Sign-in failed. Check your details and try again.");
      const data = await response.json();
      const route = window.location.pathname.match(/^\/(account|admin)\/(\d+)/);
      const expectedId = sessionStorage.getItem("id") || (route && route[2]);
      if (expectedId && String(data.id) !== expectedId) {
        throw new Error("This account does not match the open case. The case remains locked.");
      }
      if (!(await check(false, identity || email.trim()))) throw new Error("Unable to unlock. Please retry.");
    } catch (e) { setError(e.message); }
    finally { setPassword(""); setBusy(false); }
  };
  if (!logoutReason) return <div role="alert" style={{position:"fixed",top:0,left:0,right:0,zIndex:10000,background:"#fff4ce",padding:16,color:"#111"}}>
    Your session will lock soon. <button onClick={stayActive}>Stay signed in</button>
  </div>;
  const offline = logoutReason === "offline" || logoutReason === "checking";
  return <div role="dialog" aria-modal="true" aria-labelledby="session-heading" style={{position:"fixed",inset:0,zIndex:10000,background:"#222429",color:"white",display:"grid",placeItems:"center"}}>
    <div style={{width:"90%",maxWidth:460,padding:24}}>
      <h2 id="session-heading">{offline ? "Checking your session" : "Your session is locked"}</h2>
      <p>Your open form is still in this tab. Do not refresh or close it. Sign back in to continue.</p>
      {offline ? <div><p>We need a connection to verify your session.</p><button onClick={() => check(false)}>Retry connection</button></div> :
        <form onSubmit={reauthenticate}>
          <label>Email<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in and continue"}</button>
        </form>}
      {error && <p role="alert">{error}</p>}
    </div>
  </div>;
}
