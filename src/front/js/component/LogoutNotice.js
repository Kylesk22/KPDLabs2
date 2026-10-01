import React, { useContext, useState } from "react";
import { AuthContext, apiBase } from "./AuthProvider";

const buttonStyle = {background:"#176b83",color:"#fff",border:"2px solid #176b83",borderRadius:8,padding:"12px 18px",fontSize:16,fontWeight:600,lineHeight:1.4,cursor:"pointer",minHeight:48};
const inputStyle = {display:"block",width:"100%",boxSizing:"border-box",background:"#fff",color:"#172b3a",border:"1px solid #64748b",borderRadius:6,padding:"12px",fontSize:16,lineHeight:1.5,marginTop:6,minHeight:48};
const labelStyle = {display:"block",color:"#172b3a",fontSize:16,fontWeight:600,lineHeight:1.5,margin:0};
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
  if (!logoutReason) return <div role="alert" style={{position:"fixed",top:0,left:0,right:0,zIndex:10000,background:"#fff4ce",padding:16,color:"#172b3a",display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"center",fontSize:16,lineHeight:1.5,boxShadow:"0 2px 12px #0003"}}>
    Your session will lock soon. <button style={buttonStyle} onClick={stayActive}>Stay signed in</button>
  </div>;
  const offline = logoutReason === "offline" || logoutReason === "checking";
  return <div role="dialog" aria-modal="true" aria-labelledby="session-heading" style={{position:"fixed",inset:0,zIndex:10000,background:"#142532",color:"#172b3a",display:"flex",alignItems:"center",justifyContent:"center",overflowY:"auto",padding:20,boxSizing:"border-box"}}>
    <div style={{width:"100%",maxWidth:460,padding:28,boxSizing:"border-box",background:"#fff",borderRadius:12,boxShadow:"0 16px 48px #0005",margin:"auto"}}>
      <h2 id="session-heading" style={{color:"#172b3a",fontSize:28,lineHeight:1.2,fontWeight:700,margin:"0 0 16px"}}>{offline ? "Checking your session" : "Your session is locked"}</h2>
      <p style={{color:"#405466",fontSize:16,lineHeight:1.6,margin:"0 0 24px"}}>Your open form is still in this tab. Do not refresh or close it. Sign back in to continue.</p>
      {offline ? <div><p style={{color:"#405466",fontSize:16,lineHeight:1.6}}>We need a connection to verify your session.</p><button style={buttonStyle} onClick={() => check(false)}>Retry connection</button></div> :
        <form onSubmit={reauthenticate} style={{display:"grid",gap:18,margin:0}}>
          <label style={labelStyle}>Email<input style={inputStyle} type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label style={labelStyle}>Password<input style={inputStyle} type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button style={{...buttonStyle,width:"100%",opacity:busy?0.7:1}} disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in and continue"}</button>
        </form>}
      {error && <p role="alert" style={{color:"#9f1239",background:"#fff1f2",padding:12,borderRadius:6,fontSize:16,lineHeight:1.5,margin:"16px 0 0"}}>{error}</p>}
    </div>
  </div>;
}
